package com.lucasxf.ed.service;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.lucasxf.ed.domain.Follow;
import com.lucasxf.ed.dto.RelationshipStatus;
import com.lucasxf.ed.exception.AlreadyFollowingException;
import com.lucasxf.ed.exception.LearnerNotFoundException;
import com.lucasxf.ed.exception.NotFollowingException;
import com.lucasxf.ed.exception.SelfFollowException;
import com.lucasxf.ed.repository.FollowRepository;
import com.lucasxf.ed.repository.UserRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link FollowService}.
 *
 * @author Lucas Xavier Ferreira
 * @since 6.1
 */
@ExtendWith(MockitoExtension.class)
class FollowServiceTest {

    @Mock
    private FollowRepository followRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FollowService followService;

    private final UUID alice = UUID.randomUUID();
    private final UUID bob = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        // userRepository.existsById defaults to false; override per-test when needed
    }

    // ===== follow =====

    @Test
    void follow_newRelationship_savesFollow() {
        when(userRepository.existsById(bob)).thenReturn(true);
        when(followRepository.existsByFollowerIdAndFollowedId(alice, bob)).thenReturn(false);

        followService.follow(alice, bob);

        verify(followRepository).save(any(Follow.class));
    }

    @Test
    void follow_selfFollow_throwsSelfFollowException() {
        assertThatThrownBy(() -> followService.follow(alice, alice))
            .isInstanceOf(SelfFollowException.class)
            .hasMessageContaining("cannot follow yourself");

        verify(followRepository, never()).save(any());
    }

    @Test
    void follow_unknownFollowedUser_throwsLearnerNotFoundException() {
        when(userRepository.existsById(bob)).thenReturn(false);

        assertThatThrownBy(() -> followService.follow(alice, bob))
            .isInstanceOf(LearnerNotFoundException.class);

        verify(followRepository, never()).save(any());
    }

    @Test
    void follow_alreadyFollowing_throwsAlreadyFollowingException() {
        when(userRepository.existsById(bob)).thenReturn(true);
        when(followRepository.existsByFollowerIdAndFollowedId(alice, bob)).thenReturn(true);

        assertThatThrownBy(() -> followService.follow(alice, bob))
            .isInstanceOf(AlreadyFollowingException.class);

        verify(followRepository, never()).save(any());
    }

    // ===== unfollow =====

    @Test
    void unfollow_existingRelationship_deletesFollow() {
        when(followRepository.existsByFollowerIdAndFollowedId(alice, bob)).thenReturn(true);

        followService.unfollow(alice, bob);

        verify(followRepository).deleteByFollowerIdAndFollowedId(alice, bob);
    }

    @Test
    void unfollow_notFollowing_throwsNotFollowingException() {
        when(followRepository.existsByFollowerIdAndFollowedId(alice, bob)).thenReturn(false);

        assertThatThrownBy(() -> followService.unfollow(alice, bob))
            .isInstanceOf(NotFollowingException.class);

        verify(followRepository, never()).deleteByFollowerIdAndFollowedId(any(), any());
    }

    // ===== isFollowing =====

    @Test
    void isFollowing_existing_returnsTrue() {
        when(followRepository.existsByFollowerIdAndFollowedId(alice, bob)).thenReturn(true);

        assertThat(followService.isFollowing(alice, bob)).isTrue();
    }

    @Test
    void isFollowing_absent_returnsFalse() {
        when(followRepository.existsByFollowerIdAndFollowedId(alice, bob)).thenReturn(false);

        assertThat(followService.isFollowing(alice, bob)).isFalse();
    }

    // ===== areColleagues =====

    @Test
    void areColleagues_mutualFollow_returnsTrue() {
        when(followRepository.existsByFollowerIdAndFollowedId(alice, bob)).thenReturn(true);
        when(followRepository.existsByFollowerIdAndFollowedId(bob, alice)).thenReturn(true);

        assertThat(followService.areColleagues(alice, bob)).isTrue();
    }

    @Test
    void areColleagues_onlyAliceFollowsBob_returnsFalse() {
        when(followRepository.existsByFollowerIdAndFollowedId(alice, bob)).thenReturn(true);
        when(followRepository.existsByFollowerIdAndFollowedId(bob, alice)).thenReturn(false);

        assertThat(followService.areColleagues(alice, bob)).isFalse();
    }

    @Test
    void areColleagues_neitherFollows_returnsFalse() {
        when(followRepository.existsByFollowerIdAndFollowedId(alice, bob)).thenReturn(false);

        assertThat(followService.areColleagues(alice, bob)).isFalse();
    }

    // ===== getRelationship =====

    @Test
    void getRelationship_mutualFollow_returnsColleague() {
        when(followRepository.existsByFollowerIdAndFollowedId(alice, bob)).thenReturn(true);
        when(followRepository.existsByFollowerIdAndFollowedId(bob, alice)).thenReturn(true);

        assertThat(followService.getRelationship(alice, bob)).isEqualTo(RelationshipStatus.COLLEAGUE);
    }

    @Test
    void getRelationship_aliceFollowsBob_returnsFollowing() {
        when(followRepository.existsByFollowerIdAndFollowedId(alice, bob)).thenReturn(true);
        when(followRepository.existsByFollowerIdAndFollowedId(bob, alice)).thenReturn(false);

        assertThat(followService.getRelationship(alice, bob)).isEqualTo(RelationshipStatus.FOLLOWING);
    }

    @Test
    void getRelationship_bobFollowsAlice_returnsFollowedBy() {
        when(followRepository.existsByFollowerIdAndFollowedId(alice, bob)).thenReturn(false);
        when(followRepository.existsByFollowerIdAndFollowedId(bob, alice)).thenReturn(true);

        assertThat(followService.getRelationship(alice, bob)).isEqualTo(RelationshipStatus.FOLLOWED_BY);
    }

    @Test
    void getRelationship_noRelationship_returnsNone() {
        when(followRepository.existsByFollowerIdAndFollowedId(alice, bob)).thenReturn(false);
        when(followRepository.existsByFollowerIdAndFollowedId(bob, alice)).thenReturn(false);

        assertThat(followService.getRelationship(alice, bob)).isEqualTo(RelationshipStatus.NONE);
    }

    // ===== counts =====

    @Test
    void countFollowers_delegatesToRepository() {
        when(followRepository.countByFollowedId(alice)).thenReturn(7L);

        assertThat(followService.countFollowers(alice)).isEqualTo(7L);
    }

    @Test
    void countFollowing_delegatesToRepository() {
        when(followRepository.countByFollowerId(alice)).thenReturn(3L);

        assertThat(followService.countFollowing(alice)).isEqualTo(3L);
    }

    @Test
    void countColleagues_delegatesToRepository() {
        when(followRepository.countColleagues(alice)).thenReturn(2L);

        assertThat(followService.countColleagues(alice)).isEqualTo(2L);
    }
}
