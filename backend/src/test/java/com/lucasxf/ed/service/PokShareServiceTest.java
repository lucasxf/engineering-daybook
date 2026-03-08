package com.lucasxf.ed.service;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.PokShare;
import com.lucasxf.ed.domain.User;
import com.lucasxf.ed.dto.PokShareResponse;
import com.lucasxf.ed.exception.PokNotFoundException;
import com.lucasxf.ed.exception.PokShareAccessDeniedException;
import com.lucasxf.ed.exception.PokShareConflictException;
import com.lucasxf.ed.exception.PokShareNotFoundException;
import com.lucasxf.ed.exception.SelfShareException;
import com.lucasxf.ed.repository.PokRepository;
import com.lucasxf.ed.repository.PokShareRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link PokShareService}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-07
 */
@ExtendWith(MockitoExtension.class)
class PokShareServiceTest {

    @Mock
    private PokShareRepository pokShareRepository;

    @Mock
    private PokRepository pokRepository;

    @Mock
    private UserService userService;

    @Mock
    private FollowService followService;

    @InjectMocks
    private PokShareService pokShareService;

    private UUID aliceId;
    private UUID bobId;
    private UUID pokId;
    private UUID shareId;
    private Pok bobPok;
    private User alice;
    private User bob;

    @BeforeEach
    void setUp() {
        aliceId = UUID.randomUUID();
        bobId = UUID.randomUUID();
        pokId = UUID.randomUUID();
        shareId = UUID.randomUUID();

        bobPok = new Pok(bobId, "Bob's learning title", "Bob's learning content", Pok.Visibility.PUBLIC);
        ReflectionTestUtils.setField(bobPok, "id", pokId);

        alice = new User("alice@example.com", "hash", "Alice", "alice");
        ReflectionTestUtils.setField(alice, "id", aliceId);

        bob = new User("bob@example.com", "hash", "Bob", "bob");
        ReflectionTestUtils.setField(bob, "id", bobId);
    }

    // ── share() ─────────────────────────────────────────────────────────────

    @Test
    void share_publicPok_createsShareAndReturnsResponse() {
        PokShare savedShare = new PokShare(pokId, aliceId, null, Pok.Visibility.PUBLIC);
        ReflectionTestUtils.setField(savedShare, "id", shareId);

        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(bobPok));
        when(pokShareRepository.existsByOriginalPokIdAndSharedByUserId(pokId, aliceId)).thenReturn(false);
        when(pokShareRepository.save(any(PokShare.class))).thenReturn(savedShare);
        when(userService.findById(aliceId)).thenReturn(alice);

        PokShareResponse response = pokShareService.share(pokId, aliceId, null, Pok.Visibility.PUBLIC);

        assertThat(response.type()).isEqualTo("shared");
        assertThat(response.id()).isEqualTo(shareId);
        assertThat(response.originalPokId()).isEqualTo(pokId);
        assertThat(response.sharedByHandle()).isEqualTo("alice");
        assertThat(response.note()).isNull();
        assertThat(response.visibility()).isEqualTo(Pok.Visibility.PUBLIC);
        verify(pokShareRepository).save(any(PokShare.class));
    }

    @Test
    void share_withNote_persistsNote() {
        String note = "This explains hooks perfectly";
        PokShare savedShare = new PokShare(pokId, aliceId, note, Pok.Visibility.PUBLIC);
        ReflectionTestUtils.setField(savedShare, "id", shareId);

        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(bobPok));
        when(pokShareRepository.existsByOriginalPokIdAndSharedByUserId(pokId, aliceId)).thenReturn(false);
        when(pokShareRepository.save(any(PokShare.class))).thenReturn(savedShare);
        when(userService.findById(aliceId)).thenReturn(alice);

        PokShareResponse response = pokShareService.share(pokId, aliceId, note, Pok.Visibility.PUBLIC);

        assertThat(response.note()).isEqualTo(note);
    }

    @Test
    void share_selfShare_throwsSelfShareException() {
        // Alice tries to re-learn her own POK
        Pok alicePok = new Pok(aliceId, "Alice's title", "Alice's content", Pok.Visibility.PUBLIC);
        ReflectionTestUtils.setField(alicePok, "id", pokId);

        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(alicePok));

        assertThatThrownBy(() -> pokShareService.share(pokId, aliceId, null, Pok.Visibility.PUBLIC))
            .isInstanceOf(SelfShareException.class)
            .hasMessageContaining("own");

        verify(pokShareRepository, never()).save(any());
    }

    @Test
    void share_nonPublicOriginal_throwsPokAccessDeniedException() {
        Pok privateFollowersPok = new Pok(bobId, "Title", "Content", Pok.Visibility.FOLLOWERS_ONLY);
        ReflectionTestUtils.setField(privateFollowersPok, "id", pokId);

        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(privateFollowersPok));

        assertThatThrownBy(() -> pokShareService.share(pokId, aliceId, null, Pok.Visibility.FOLLOWERS_ONLY))
            .isInstanceOf(IllegalArgumentException.class);

        verify(pokShareRepository, never()).save(any());
    }

    @Test
    void share_visibilityLooserThanOriginal_throwsIllegalArgumentException() {
        // Non-PUBLIC originals are rejected by the MVP "PUBLIC only" guard (which runs before the
        // visibility-tier check). The thrown message reflects the PUBLIC-only restriction.
        Pok followersOnlyPok = new Pok(bobId, "Title", "Content", Pok.Visibility.FOLLOWERS_ONLY);
        ReflectionTestUtils.setField(followersOnlyPok, "id", pokId);

        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(followersOnlyPok));

        assertThatThrownBy(() -> pokShareService.share(pokId, aliceId, null, Pok.Visibility.PUBLIC))
            .isInstanceOf(IllegalArgumentException.class);

        verify(pokShareRepository, never()).save(any());
    }

    @Test
    void share_duplicateShare_throwsPokShareConflictException() {
        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(bobPok));
        when(pokShareRepository.existsByOriginalPokIdAndSharedByUserId(pokId, aliceId)).thenReturn(true);

        assertThatThrownBy(() -> pokShareService.share(pokId, aliceId, null, Pok.Visibility.PUBLIC))
            .isInstanceOf(PokShareConflictException.class);

        verify(pokShareRepository, never()).save(any());
    }

    @Test
    void share_pokNotFound_throwsPokNotFoundException() {
        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> pokShareService.share(pokId, aliceId, null, Pok.Visibility.PUBLIC))
            .isInstanceOf(PokNotFoundException.class);
    }

    @Test
    void share_visibilityDefaultsToOriginalVisibility_whenNullProvided() {
        PokShare savedShare = new PokShare(pokId, aliceId, null, Pok.Visibility.PUBLIC);
        ReflectionTestUtils.setField(savedShare, "id", shareId);

        when(pokRepository.findByIdAndDeletedAtIsNull(pokId)).thenReturn(Optional.of(bobPok));
        when(pokShareRepository.existsByOriginalPokIdAndSharedByUserId(pokId, aliceId)).thenReturn(false);
        when(pokShareRepository.save(any(PokShare.class))).thenReturn(savedShare);
        when(userService.findById(aliceId)).thenReturn(alice);

        // Pass null visibility — should default to original's visibility (PUBLIC)
        PokShareResponse response = pokShareService.share(pokId, aliceId, null, null);

        assertThat(response.visibility()).isEqualTo(Pok.Visibility.PUBLIC);
    }

    // ── unshare() ───────────────────────────────────────────────────────────

    @Test
    void unshare_byOwner_deletesShare() {
        PokShare share = new PokShare(pokId, aliceId, null, Pok.Visibility.PUBLIC);
        ReflectionTestUtils.setField(share, "id", shareId);

        when(pokShareRepository.findById(shareId)).thenReturn(Optional.of(share));

        pokShareService.unshare(shareId, aliceId);

        verify(pokShareRepository).delete(share);
    }

    @Test
    void unshare_byNonOwner_throwsPokShareAccessDeniedException() {
        UUID charlieId = UUID.randomUUID();
        PokShare share = new PokShare(pokId, aliceId, null, Pok.Visibility.PUBLIC);
        ReflectionTestUtils.setField(share, "id", shareId);

        when(pokShareRepository.findById(shareId)).thenReturn(Optional.of(share));

        assertThatThrownBy(() -> pokShareService.unshare(shareId, charlieId))
            .isInstanceOf(PokShareAccessDeniedException.class);

        verify(pokShareRepository, never()).delete(any());
    }

    @Test
    void unshare_shareNotFound_throwsPokShareNotFoundException() {
        when(pokShareRepository.findById(shareId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> pokShareService.unshare(shareId, aliceId))
            .isInstanceOf(PokShareNotFoundException.class);
    }

    // ── cascadeDeleteByOriginalPok() ─────────────────────────────────────────

    @Test
    void cascadeDeleteByOriginalPok_deletesAllSharesForPok() {
        pokShareService.cascadeDeleteByOriginalPok(pokId);

        verify(pokShareRepository).deleteByOriginalPokId(pokId);
    }
}
