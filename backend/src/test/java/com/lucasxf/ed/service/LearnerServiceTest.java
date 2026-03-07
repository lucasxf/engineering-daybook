package com.lucasxf.ed.service;

import java.util.Collection;
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
import com.lucasxf.ed.dto.RelationshipStatus;
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

/**
 * Unit tests for {@link LearnerService}.
 *
 * @author Lucas Xavier Ferreira
 * @since 2026-03-04
 */
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

    @Mock
    private FollowService followService;

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
    void getProfile_followersOnlyProfile_nonFollower_returnsPrivateShell() {
        User alice = makeUser("alice", User.ProfileVisibility.FOLLOWERS_ONLY);
        when(userService.findByHandle("alice")).thenReturn(Optional.of(alice));
        when(followService.isFollowing(bobId, aliceId)).thenReturn(false);

        LearnerProfileResponse response = learnerService.getProfile("alice", bobId);

        assertThat(response.profileVisibility()).isEqualTo(User.ProfileVisibility.PRIVATE);
        assertThat(response.displayName()).isNull();
    }

    @Test
    void getProfile_followersOnlyProfile_follower_returnsFullProfile() {
        User alice = makeUser("alice", User.ProfileVisibility.FOLLOWERS_ONLY);
        when(userService.findByHandle("alice")).thenReturn(Optional.of(alice));
        when(followService.isFollowing(bobId, aliceId)).thenReturn(true);
        when(followService.areColleagues(bobId, aliceId)).thenReturn(false);
        when(followService.getRelationship(bobId, aliceId)).thenReturn(RelationshipStatus.FOLLOWING);
        Pok pub = makePok(Pok.Visibility.PUBLIC);
        Pok fol = makePok(Pok.Visibility.FOLLOWERS_ONLY);
        when(pokRepository.findByUserIdAndVisibilityInAndDeletedAtIsNull(
            eq(aliceId), any(Collection.class), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(pub, fol)));

        LearnerProfileResponse response = learnerService.getProfile("alice", bobId);

        assertThat(response.displayName()).isEqualTo("Alice");
        assertThat(response.learnings()).hasSize(2);
        assertThat(response.relationshipStatus()).isEqualTo(RelationshipStatus.FOLLOWING);
    }

    @Test
    void getProfile_colleaguesOnlyProfile_colleague_returnsFullProfile() {
        User alice = makeUser("alice", User.ProfileVisibility.COLLEAGUES_ONLY);
        when(userService.findByHandle("alice")).thenReturn(Optional.of(alice));
        when(followService.areColleagues(bobId, aliceId)).thenReturn(true);
        when(followService.getRelationship(bobId, aliceId)).thenReturn(RelationshipStatus.COLLEAGUE);
        when(pokRepository.findByUserIdAndVisibilityInAndDeletedAtIsNull(
            eq(aliceId), any(Collection.class), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of()));

        LearnerProfileResponse response = learnerService.getProfile("alice", bobId);

        assertThat(response.displayName()).isEqualTo("Alice");
        assertThat(response.relationshipStatus()).isEqualTo(RelationshipStatus.COLLEAGUE);
    }

    @Test
    void getProfile_colleaguesOnlyProfile_followerNotColleague_returnsPrivateShell() {
        User alice = makeUser("alice", User.ProfileVisibility.COLLEAGUES_ONLY);
        when(userService.findByHandle("alice")).thenReturn(Optional.of(alice));
        when(followService.areColleagues(bobId, aliceId)).thenReturn(false);

        LearnerProfileResponse response = learnerService.getProfile("alice", bobId);

        assertThat(response.profileVisibility()).isEqualTo(User.ProfileVisibility.PRIVATE);
    }

    @Test
    void getProfile_publicProfile_nonOwner_returnsFullProfileWithRelationship() {
        User alice = makeUser("alice", User.ProfileVisibility.PUBLIC);
        when(userService.findByHandle("alice")).thenReturn(Optional.of(alice));
        when(followService.areColleagues(bobId, aliceId)).thenReturn(false);
        when(followService.isFollowing(bobId, aliceId)).thenReturn(false);
        when(followService.getRelationship(bobId, aliceId)).thenReturn(RelationshipStatus.NONE);
        Pok pub = makePok(Pok.Visibility.PUBLIC);
        when(pokRepository.findByUserIdAndVisibilityInAndDeletedAtIsNull(
            eq(aliceId), any(Collection.class), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(pub)));

        LearnerProfileResponse response = learnerService.getProfile("alice", bobId);

        assertThat(response.handle()).isEqualTo("alice");
        assertThat(response.displayName()).isEqualTo("Alice");
        assertThat(response.learnings()).hasSize(1);
        assertThat(response.learningCount()).isNull(); // anti-vanity
        assertThat(response.profileVisibility()).isNull();
        assertThat(response.relationshipStatus()).isEqualTo(RelationshipStatus.NONE);
        assertThat(response.followerCount()).isNull();
    }

    @Test
    void getProfile_privateProfile_owner_returnsFullProfileWithSocialCounts() {
        User alice = makeUser("alice", User.ProfileVisibility.PRIVATE);
        when(userService.findByHandle("alice")).thenReturn(Optional.of(alice));
        Pok pub = makePok(Pok.Visibility.PUBLIC);
        Pok priv = makePok(Pok.Visibility.PRIVATE);
        when(pokRepository.findByUserIdAndDeletedAtIsNull(eq(aliceId), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(pub, priv)));
        when(pokRepository.countByUserIdAndDeletedAtIsNull(aliceId)).thenReturn(25L);
        when(followService.countFollowers(aliceId)).thenReturn(10L);
        when(followService.countFollowing(aliceId)).thenReturn(5L);
        when(followService.countColleagues(aliceId)).thenReturn(3L);

        LearnerProfileResponse response = learnerService.getProfile("alice", aliceId);

        assertThat(response.learnings()).hasSize(2);
        assertThat(response.learningCount()).isEqualTo(25);
        assertThat(response.followerCount()).isEqualTo(10L);
        assertThat(response.followingCount()).isEqualTo(5L);
        assertThat(response.colleagueCount()).isEqualTo(3L);
        assertThat(response.relationshipStatus()).isNull(); // owner has no self-relationship
    }

    @Test
    void getProfile_publicProfile_owner_learningsIncludeVisibilityBadge() {
        User alice = makeUser("alice", User.ProfileVisibility.PUBLIC);
        when(userService.findByHandle("alice")).thenReturn(Optional.of(alice));
        Pok priv = makePok(Pok.Visibility.PRIVATE);
        when(pokRepository.findByUserIdAndDeletedAtIsNull(eq(aliceId), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(priv)));
        when(pokRepository.countByUserIdAndDeletedAtIsNull(aliceId)).thenReturn(1L);
        when(followService.countFollowers(aliceId)).thenReturn(0L);
        when(followService.countFollowing(aliceId)).thenReturn(0L);
        when(followService.countColleagues(aliceId)).thenReturn(0L);

        LearnerProfileResponse response = learnerService.getProfile("alice", aliceId);

        assertThat(response.learnings().get(0).visibility()).isEqualTo(Pok.Visibility.PRIVATE);
    }

    @Test
    void getProfile_publicProfile_nonOwner_learningsHaveNoVisibilityField() {
        User alice = makeUser("alice", User.ProfileVisibility.PUBLIC);
        when(userService.findByHandle("alice")).thenReturn(Optional.of(alice));
        when(followService.areColleagues(bobId, aliceId)).thenReturn(false);
        when(followService.isFollowing(bobId, aliceId)).thenReturn(false);
        when(followService.getRelationship(bobId, aliceId)).thenReturn(RelationshipStatus.NONE);
        Pok pub = makePok(Pok.Visibility.PUBLIC);
        when(pokRepository.findByUserIdAndVisibilityInAndDeletedAtIsNull(
            eq(aliceId), any(Collection.class), any(Pageable.class)))
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
    void getLearnerPoks_followersOnlyProfile_nonFollower_throws403() {
        User alice = makeUser("alice", User.ProfileVisibility.FOLLOWERS_ONLY);
        when(userService.findByHandle("alice")).thenReturn(Optional.of(alice));
        when(followService.isFollowing(bobId, aliceId)).thenReturn(false);

        assertThatThrownBy(() -> learnerService.getLearnerPoks("alice", bobId, 0, 20))
            .isInstanceOf(LearnerAccessDeniedException.class);
    }

    @Test
    void getLearnerPoks_publicProfile_follower_returnsFollowersOnlyAndPublic() {
        User alice = makeUser("alice", User.ProfileVisibility.PUBLIC);
        when(userService.findByHandle("alice")).thenReturn(Optional.of(alice));
        when(followService.areColleagues(bobId, aliceId)).thenReturn(false);
        when(followService.isFollowing(bobId, aliceId)).thenReturn(true);
        Pok pub = makePok(Pok.Visibility.PUBLIC);
        Pok fol = makePok(Pok.Visibility.FOLLOWERS_ONLY);
        when(pokRepository.findByUserIdAndVisibilityInAndDeletedAtIsNull(
            eq(aliceId), any(Collection.class), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(pub, fol)));
        when(userTagRepository.findByUserIdAndDeletedAtIsNull(aliceId)).thenReturn(List.of());
        when(pokTagRepository.findByPokId(any(UUID.class))).thenReturn(List.of());

        Page<PokResponse> result = learnerService.getLearnerPoks("alice", bobId, 0, 20);

        assertThat(result.getContent()).hasSize(2);
    }

    @Test
    void getLearnerPoks_publicProfile_nonFollower_returnsOnlyPublicPoks() {
        User alice = makeUser("alice", User.ProfileVisibility.PUBLIC);
        when(userService.findByHandle("alice")).thenReturn(Optional.of(alice));
        when(followService.areColleagues(bobId, aliceId)).thenReturn(false);
        when(followService.isFollowing(bobId, aliceId)).thenReturn(false);
        Pok pub = makePok(Pok.Visibility.PUBLIC);
        when(pokRepository.findByUserIdAndVisibilityInAndDeletedAtIsNull(
            eq(aliceId), any(Collection.class), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(pub)));
        when(userTagRepository.findByUserIdAndDeletedAtIsNull(aliceId)).thenReturn(List.of());
        when(pokTagRepository.findByPokId(any(UUID.class))).thenReturn(List.of());

        Page<PokResponse> result = learnerService.getLearnerPoks("alice", bobId, 0, 20);

        assertThat(result.getContent()).hasSize(1);
    }
}
