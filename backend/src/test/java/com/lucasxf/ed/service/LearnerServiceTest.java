package com.lucasxf.ed.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.User;
import com.lucasxf.ed.dto.LearnerProfileResponse;
import com.lucasxf.ed.dto.PokResponse;
import com.lucasxf.ed.exception.LearnerAccessDeniedException;
import com.lucasxf.ed.exception.LearnerNotFoundException;
import com.lucasxf.ed.repository.PokRepository;
import com.lucasxf.ed.repository.PokTagRepository;
import com.lucasxf.ed.repository.UserTagRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.util.ReflectionTestUtils.setField;

@ExtendWith(MockitoExtension.class)
class LearnerServiceTest {

    @Mock
    private UserService userService;

    @Mock
    private PokRepository pokRepository;

    @Mock
    private PokTagRepository pokTagRepository;

    @Mock
    private UserTagRepository userTagRepository;

    @InjectMocks
    private LearnerService learnerService;

    private final UUID aliceId = UUID.randomUUID();
    private final UUID bobId = UUID.randomUUID();

    private User makeUser(String handle, User.ProfileVisibility profileVisibility) {
        User user = new User("alice@example.com", "hash", "Alice", handle);
        setField(user, "id", aliceId);
        user.setProfileVisibility(profileVisibility);
        return user;
    }

    private Pok makePok(Pok.Visibility visibility) {
        Pok pok = new Pok(aliceId, null, "content", visibility);
        setField(pok, "id", UUID.randomUUID());
        return pok;
    }

    // ===== getProfile =====

    @Test
    void getProfile_unknownHandle_throws404() {
        when(userService.findByHandle("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> learnerService.getProfile("ghost", bobId))
            .isInstanceOf(LearnerNotFoundException.class)
            .hasMessageContaining("ghost");
    }

    @Test
    void getProfile_privateProfile_nonOwner_returnsPrivateShell() {
        User alice = makeUser("alice", User.ProfileVisibility.PRIVATE);
        when(userService.findByHandle("alice")).thenReturn(Optional.of(alice));

        LearnerProfileResponse response = learnerService.getProfile("alice", bobId);

        assertThat(response.handle()).isEqualTo("alice");
        assertThat(response.profileVisibility()).isEqualTo(User.ProfileVisibility.PRIVATE);
        assertThat(response.displayName()).isNull();
        assertThat(response.learnings()).isNull();
        assertThat(response.learningCount()).isNull();
    }

    @Test
    void getProfile_publicProfile_nonOwner_returnsFullProfileNoCount() {
        User alice = makeUser("alice", User.ProfileVisibility.PUBLIC);
        when(userService.findByHandle("alice")).thenReturn(Optional.of(alice));
        Pok pok = makePok(Pok.Visibility.PUBLIC);
        when(pokRepository.findByUserIdAndVisibilityAndDeletedAtIsNull(
            eq(aliceId), eq(Pok.Visibility.PUBLIC), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(pok)));

        LearnerProfileResponse response = learnerService.getProfile("alice", bobId);

        assertThat(response.handle()).isEqualTo("alice");
        assertThat(response.displayName()).isEqualTo("Alice");
        assertThat(response.learnings()).hasSize(1);
        assertThat(response.learningCount()).isNull(); // anti-vanity — not shown to visitors
        assertThat(response.profileVisibility()).isNull(); // not in full response
    }

    @Test
    void getProfile_privateProfile_owner_returnsFullProfileWithCount() {
        User alice = makeUser("alice", User.ProfileVisibility.PRIVATE);
        when(userService.findByHandle("alice")).thenReturn(Optional.of(alice));
        Pok pub = makePok(Pok.Visibility.PUBLIC);
        Pok priv = makePok(Pok.Visibility.PRIVATE);
        when(pokRepository.findByUserIdAndDeletedAtIsNull(eq(aliceId), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(pub, priv)));
        // Total count may exceed the profile page size — simulate 25 total learnings
        when(pokRepository.countByUserIdAndDeletedAtIsNull(aliceId)).thenReturn(25L);

        LearnerProfileResponse response = learnerService.getProfile("alice", aliceId);

        assertThat(response.learnings()).hasSize(2); // only paged preview (2 in this mock)
        assertThat(response.learningCount()).isEqualTo(25); // accurate total from count query
    }

    @Test
    void getProfile_publicProfile_owner_learningsIncludeVisibilityBadge() {
        User alice = makeUser("alice", User.ProfileVisibility.PUBLIC);
        when(userService.findByHandle("alice")).thenReturn(Optional.of(alice));
        Pok priv = makePok(Pok.Visibility.PRIVATE);
        when(pokRepository.findByUserIdAndDeletedAtIsNull(eq(aliceId), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(priv)));
        when(pokRepository.countByUserIdAndDeletedAtIsNull(aliceId)).thenReturn(1L);

        LearnerProfileResponse response = learnerService.getProfile("alice", aliceId);

        assertThat(response.learnings().get(0).visibility()).isEqualTo(Pok.Visibility.PRIVATE);
    }

    @Test
    void getProfile_publicProfile_nonOwner_learningsHaveNoVisibilityField() {
        User alice = makeUser("alice", User.ProfileVisibility.PUBLIC);
        when(userService.findByHandle("alice")).thenReturn(Optional.of(alice));
        Pok pub = makePok(Pok.Visibility.PUBLIC);
        when(pokRepository.findByUserIdAndVisibilityAndDeletedAtIsNull(
            eq(aliceId), eq(Pok.Visibility.PUBLIC), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(pub)));

        LearnerProfileResponse response = learnerService.getProfile("alice", bobId);

        assertThat(response.learnings().get(0).visibility()).isNull(); // anti-vanity
    }

    // ===== getLearnerPoks =====

    @Test
    void getLearnerPoks_unknownHandle_throws404() {
        when(userService.findByHandle("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> learnerService.getLearnerPoks("ghost", bobId, 0, 20))
            .isInstanceOf(LearnerNotFoundException.class);
    }

    @Test
    void getLearnerPoks_privateProfile_nonOwner_throws403() {
        User alice = makeUser("alice", User.ProfileVisibility.PRIVATE);
        when(userService.findByHandle("alice")).thenReturn(Optional.of(alice));

        assertThatThrownBy(() -> learnerService.getLearnerPoks("alice", bobId, 0, 20))
            .isInstanceOf(LearnerAccessDeniedException.class);
    }

    @Test
    void getLearnerPoks_publicProfile_nonOwner_returnsOnlyPublicPoks() {
        User alice = makeUser("alice", User.ProfileVisibility.PUBLIC);
        when(userService.findByHandle("alice")).thenReturn(Optional.of(alice));
        Pok pub = makePok(Pok.Visibility.PUBLIC);
        Page<Pok> pageResult = new PageImpl<>(List.of(pub));
        when(pokRepository.findByUserIdAndVisibilityAndDeletedAtIsNull(
            eq(aliceId), eq(Pok.Visibility.PUBLIC), any(Pageable.class)))
            .thenReturn(pageResult);
        when(userTagRepository.findByUserIdAndDeletedAtIsNull(aliceId)).thenReturn(List.of());
        when(pokTagRepository.findByPokId(any(UUID.class))).thenReturn(List.of());

        Page<PokResponse> result = learnerService.getLearnerPoks("alice", bobId, 0, 20);

        assertThat(result.getContent()).hasSize(1);
    }
}
