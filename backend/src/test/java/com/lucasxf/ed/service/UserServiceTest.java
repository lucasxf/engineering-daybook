package com.lucasxf.ed.service;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.User;
import com.lucasxf.ed.exception.UserNotFoundException;
import com.lucasxf.ed.repository.UserRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private final UUID userId = UUID.randomUUID();

    private User makeUser() {
        return new User("alice@example.com", "hash", "Alice", "alice");
    }

    // ===== findById =====

    @Test
    void findById_existingUser_returnsUser() {
        User user = makeUser();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        User result = userService.findById(userId);

        assertThat(result).isSameAs(user);
    }

    @Test
    void findById_unknownUser_throwsUserNotFoundException() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findById(userId))
            .isInstanceOf(UserNotFoundException.class)
            .hasMessageContaining(userId.toString());
    }

    // ===== updateDefaultPokVisibility =====

    @Test
    void updateDefaultPokVisibility_existingUser_updatesAndSaves() {
        User user = makeUser();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        userService.updateDefaultPokVisibility(userId, Pok.Visibility.PUBLIC);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getDefaultPokVisibility()).isEqualTo(Pok.Visibility.PUBLIC);
    }

    @Test
    void updateDefaultPokVisibility_unknownUser_throwsUserNotFoundException() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateDefaultPokVisibility(userId, Pok.Visibility.PUBLIC))
            .isInstanceOf(UserNotFoundException.class);
    }

    // ===== updateProfileVisibility =====

    @Test
    void updateProfileVisibility_existingUser_updatesAndSaves() {
        User user = makeUser();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        userService.updateProfileVisibility(userId, User.ProfileVisibility.PUBLIC);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getProfileVisibility()).isEqualTo(User.ProfileVisibility.PUBLIC);
    }

    @Test
    void updateProfileVisibility_unknownUser_throwsUserNotFoundException() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateProfileVisibility(userId, User.ProfileVisibility.PUBLIC))
            .isInstanceOf(UserNotFoundException.class);
    }

    // ===== findByHandle =====

    @Test
    void findByHandle_existingHandle_returnsUser() {
        User user = makeUser();
        when(userRepository.findByHandle("alice")).thenReturn(Optional.of(user));

        Optional<User> result = userService.findByHandle("alice");

        assertThat(result).contains(user);
    }

    @Test
    void findByHandle_unknownHandle_returnsEmpty() {
        when(userRepository.findByHandle("ghost")).thenReturn(Optional.empty());

        Optional<User> result = userService.findByHandle("ghost");

        assertThat(result).isEmpty();
    }
}
