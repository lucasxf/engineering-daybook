package com.lucasxf.ed.service;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
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
import com.lucasxf.ed.dto.FeedItemResponse;
import com.lucasxf.ed.dto.LearnerProfileResponse;
import com.lucasxf.ed.dto.LearnerSearchResult;
import com.lucasxf.ed.dto.PokResponse;
import com.lucasxf.ed.dto.RelationshipStatus;
import com.lucasxf.ed.exception.LearnerAccessDeniedException;
import com.lucasxf.ed.exception.LearnerNotFoundException;
import com.lucasxf.ed.repository.PokRepository;
import com.lucasxf.ed.repository.PokShareRepository;
import com.lucasxf.ed.repository.PokTagRepository;
import com.lucasxf.ed.repository.UserTagRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.ArgumentMatchers.anyString;
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

    @Mock
    private PokShareRepository pokShareRepository;

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
        when(followService.getRelationship(bobId, aliceId)).thenReturn(RelationshipStatus.NONE);

        LearnerProfileResponse response = learnerService.getProfile("alice", bobId);

        assertThat(response.profileVisibility()).isEqualTo(User.ProfileVisibility.PRIVATE);
        assertThat(response.displayName()).isNull();
    }

    @Test
    void getProfile_followersOnlyProfile_follower_returnsFullProfile() {
        User alice = makeUser("alice", User.ProfileVisibility.FOLLOWERS_ONLY);
        when(userService.findByHandle("alice")).thenReturn(Optional.of(alice));
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
        when(followService.getRelationship(bobId, aliceId)).thenReturn(RelationshipStatus.FOLLOWING);

        LearnerProfileResponse response = learnerService.getProfile("alice", bobId);

        assertThat(response.profileVisibility()).isEqualTo(User.ProfileVisibility.PRIVATE);
    }

    @Test
    void getProfile_publicProfile_nonOwner_returnsFullProfileWithRelationship() {
        User alice = makeUser("alice", User.ProfileVisibility.PUBLIC);
        when(userService.findByHandle("alice")).thenReturn(Optional.of(alice));
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
        when(followService.getRelationship(bobId, aliceId)).thenReturn(RelationshipStatus.NONE);

        assertThatThrownBy(() -> learnerService.getLearnerPoks("alice", bobId, 0, 20))
            .isInstanceOf(LearnerAccessDeniedException.class);
    }

    @Test
    void getLearnerPoks_publicProfile_follower_returnsFollowersOnlyAndPublic() {
        User alice = makeUser("alice", User.ProfileVisibility.PUBLIC);
        when(userService.findByHandle("alice")).thenReturn(Optional.of(alice));
        when(followService.getRelationship(bobId, aliceId)).thenReturn(RelationshipStatus.FOLLOWING);
        Pok pub = makePok(Pok.Visibility.PUBLIC);
        Pok fol = makePok(Pok.Visibility.FOLLOWERS_ONLY);
        when(pokRepository.findByUserIdAndVisibilityInAndDeletedAtIsNull(
            eq(aliceId), any(Collection.class), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(pub, fol)));
        when(pokShareRepository.findBySharedByUserIdAndVisibilityIn(
            eq(aliceId), any(Collection.class), any(Pageable.class)))
            .thenReturn(Page.empty());
        when(userTagRepository.findByUserIdAndDeletedAtIsNull(aliceId)).thenReturn(List.of());
        when(pokTagRepository.findByPokId(any(UUID.class))).thenReturn(List.of());

        Page<FeedItemResponse> result = learnerService.getLearnerPoks("alice", bobId, 0, 20);

        assertThat(result.getContent()).hasSize(2);
    }

    @Test
    void getLearnerPoks_publicProfile_nonFollower_returnsOnlyPublicPoks() {
        User alice = makeUser("alice", User.ProfileVisibility.PUBLIC);
        when(userService.findByHandle("alice")).thenReturn(Optional.of(alice));
        when(followService.getRelationship(bobId, aliceId)).thenReturn(RelationshipStatus.NONE);
        Pok pub = makePok(Pok.Visibility.PUBLIC);
        when(pokRepository.findByUserIdAndVisibilityInAndDeletedAtIsNull(
            eq(aliceId), any(Collection.class), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(pub)));
        when(pokShareRepository.findBySharedByUserIdAndVisibilityIn(
            eq(aliceId), any(Collection.class), any(Pageable.class)))
            .thenReturn(Page.empty());
        when(userTagRepository.findByUserIdAndDeletedAtIsNull(aliceId)).thenReturn(List.of());
        when(pokTagRepository.findByPokId(any(UUID.class))).thenReturn(List.of());

        Page<FeedItemResponse> result = learnerService.getLearnerPoks("alice", bobId, 0, 20);

        assertThat(result.getContent()).hasSize(1);
    }

    // ===== searchLearners =====

    @Test
    void searchLearners_shortQuery_returnsEmptyPage() {
        Page<LearnerSearchResult> result = learnerService.searchLearners("a", aliceId, 0, 20);
        assertThat(result.getContent()).isEmpty();
        assertThat(result.getTotalElements()).isZero();
    }

    @Test
    void searchLearners_nullQuery_returnsEmptyPage() {
        Page<LearnerSearchResult> result = learnerService.searchLearners(null, aliceId, 0, 20);
        assertThat(result.getContent()).isEmpty();
    }

    @Test
    void searchLearners_delegatesToUserService_andMapsRelationship() {
        User bob = new User("bob@x.com", "h", "Bob Builder", "bob");
        setField(bob, "id", bobId);
        bob.setProfileVisibility(User.ProfileVisibility.PUBLIC);

        when(userService.searchPublicLearners(eq("bob"), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(bob)));
        when(followService.getRelationships(eq(aliceId), anySet()))
            .thenReturn(Map.of(bobId, RelationshipStatus.FOLLOWING));

        Page<LearnerSearchResult> result = learnerService.searchLearners("bob", aliceId, 0, 20);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).handle()).isEqualTo("bob");
        assertThat(result.getContent().get(0).displayName()).isEqualTo("Bob Builder");
        assertThat(result.getContent().get(0).relationship()).isEqualTo(RelationshipStatus.FOLLOWING);
    }

    @Test
    void searchLearners_selfInResults_hasNullRelationship() {
        User alice = makeUser("alice", User.ProfileVisibility.PUBLIC);

        when(userService.searchPublicLearners(eq("alice"), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(alice)));

        Page<LearnerSearchResult> result = learnerService.searchLearners("alice", aliceId, 0, 20);

        assertThat(result.getContent().get(0).relationship()).isNull();
    }

    @Test
    void searchLearners_whitespaceTrimmingApplied() {
        User bob = new User("bob@x.com", "h", "Bob", "bob");
        setField(bob, "id", bobId);
        bob.setProfileVisibility(User.ProfileVisibility.PUBLIC);

        when(userService.searchPublicLearners(eq("bob"), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(bob)));
        when(followService.getRelationships(any(), anySet()))
            .thenReturn(Map.of(bobId, RelationshipStatus.NONE));

        Page<LearnerSearchResult> result = learnerService.searchLearners("  bob  ", aliceId, 0, 20);

        assertThat(result.getContent()).hasSize(1);
    }
}
