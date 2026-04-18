package com.lucasxf.ed.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.lucasxf.ed.domain.Pok;
import com.lucasxf.ed.domain.User;
import com.lucasxf.ed.exception.UserNotFoundException;
import com.lucasxf.ed.repository.FollowRepository;
import com.lucasxf.ed.repository.PokAuditLogRepository;
import com.lucasxf.ed.repository.PokRepository;
import com.lucasxf.ed.repository.PokShareRepository;
import com.lucasxf.ed.repository.PokTagRepository;
import com.lucasxf.ed.repository.RefreshTokenRepository;
import com.lucasxf.ed.repository.UserRepository;
import com.lucasxf.ed.repository.UserTagRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PokRepository pokRepository;

    @Mock
    private PokTagRepository pokTagRepository;

    @Mock
    private PokAuditLogRepository pokAuditLogRepository;

    @Mock
    private PokShareRepository pokShareRepository;

    @Mock
    private FollowRepository followRepository;

    @Mock
    private UserTagRepository userTagRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private StorageService storageService;

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

    // ===== updateBio =====

    @Test
    void updateBio_validText_updatesAndSaves() {
        User user = makeUser();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        userService.updateBio(userId, "I love learning!");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getBio()).isEqualTo("I love learning!");
    }

    @Test
    void updateBio_nullBio_clearsAndSaves() {
        User user = makeUser();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        userService.updateBio(userId, null);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getBio()).isNull();
    }

    @Test
    void updateBio_withHttpUrl_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> userService.updateBio(userId, "Visit http://example.com"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("URL");
    }

    @Test
    void updateBio_withHttpsUrl_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> userService.updateBio(userId, "See https://example.com"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("URL");
    }

    @Test
    void updateBio_withWwwUrl_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> userService.updateBio(userId, "Check www.example.com"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("URL");
    }

    @Test
    void updateBio_unknownUser_throwsUserNotFoundException() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateBio(userId, "text"))
            .isInstanceOf(UserNotFoundException.class);
    }

    // ===== updateDisplayName =====

    @Test
    void updateDisplayName_validName_updatesAndSaves() {
        User user = makeUser();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        userService.updateDisplayName(userId, "Alice Smith");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getDisplayName()).isEqualTo("Alice Smith");
    }

    @Test
    void updateDisplayName_blankName_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> userService.updateDisplayName(userId, "  "))
            .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void updateDisplayName_unknownUser_throwsUserNotFoundException() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateDisplayName(userId, "Alice Smith"))
            .isInstanceOf(UserNotFoundException.class);
    }

    // ===== updateAvatarUrl =====

    @Test
    void updateAvatarUrl_withUrl_updatesAndSaves() {
        User user = makeUser();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        userService.updateAvatarUrl(userId, "https://storage.example.com/avatars/abc.jpg");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getAvatarUrl())
            .isEqualTo("https://storage.example.com/avatars/abc.jpg");
    }

    @Test
    void updateAvatarUrl_withNull_clearsAvatar() {
        User user = makeUser();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        userService.updateAvatarUrl(userId, null);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getAvatarUrl()).isNull();
    }

    // ===== updateTheme =====

    @Test
    void updateTheme_validTheme_updatesAndSaves() {
        User user = makeUser();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        userService.updateTheme(userId, "light");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getTheme()).isEqualTo("light");
    }

    @Test
    void updateTheme_unknownUser_throwsUserNotFoundException() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateTheme(userId, "dark"))
            .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    void updateTheme_unknownTheme_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> userService.updateTheme(userId, "rainbow"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Theme must be one of");
    }

    // ===== updateLocale =====

    @Test
    void updateLocale_validLocale_updatesAndSaves() {
        User user = makeUser();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        userService.updateLocale(userId, "pt-BR");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getLocale()).isEqualTo("pt-BR");
    }

    @Test
    void updateLocale_unknownUser_throwsUserNotFoundException() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateLocale(userId, "EN"))
            .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    void updateLocale_unknownLocale_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> userService.updateLocale(userId, "fr-FR"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Locale must be one of");
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

    // ===== deleteAccount =====

    private User makeUserWithId() {
        User user = makeUser();
        ReflectionTestUtils.setField(user, "id", userId);
        return user;
    }

    @Test
    void deleteAccount_callsCascadeInCorrectOrder() {
        User user = makeUserWithId();
        List<UUID> pokIds = List.of(UUID.randomUUID(), UUID.randomUUID());
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(pokRepository.findIdsByUserId(userId)).thenReturn(pokIds);

        userService.deleteAccount(userId);

        InOrder order = inOrder(
            pokShareRepository,
            followRepository,
            pokTagRepository,
            pokAuditLogRepository,
            pokRepository,
            userTagRepository,
            refreshTokenRepository,
            storageService,
            userRepository);

        order.verify(pokShareRepository).deleteAllBySharedByUserId(userId);
        order.verify(pokShareRepository).deleteByOriginalPokIdIn(pokIds);
        order.verify(followRepository).deleteAllByFollowerId(userId);
        order.verify(followRepository).deleteAllByFollowedId(userId);
        order.verify(pokTagRepository).deleteByPokIdIn(pokIds);
        order.verify(pokAuditLogRepository).deleteByPokIdIn(pokIds);
        order.verify(pokRepository).deleteAllByUserId(userId);
        order.verify(userTagRepository).deleteAllByUserId(userId);
        order.verify(refreshTokenRepository).deleteAllByUserId(userId);
        order.verify(storageService).delete(userId);
        order.verify(userRepository).save(user);
    }

    @Test
    void deleteAccount_anonymizesUserFields() {
        User user = makeUserWithId();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(pokRepository.findIdsByUserId(userId)).thenReturn(List.of());

        userService.deleteAccount(userId);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();

        assertThat(saved.getEmail()).startsWith("deleted-").endsWith("@deleted.learnimo.net");
        assertThat(saved.getHandle()).startsWith("deleted_");
        assertThat(saved.getDisplayName()).isEqualTo("[deleted]");
        assertThat(saved.getBio()).isNull();
        assertThat(saved.getAvatarUrl()).isNull();
        assertThat(saved.getPasswordHash()).isNull();
        assertThat(saved.getDeletedAt()).isNotNull();
    }

    @Test
    void deleteAccount_idempotent_whenUserAlreadyDeleted_noCascadeCalls() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        userService.deleteAccount(userId);

        verify(pokRepository, never()).findIdsByUserId(userId);
        verify(pokShareRepository, never()).deleteAllBySharedByUserId(userId);
        verify(followRepository, never()).deleteAllByFollowerId(userId);
        verify(userTagRepository, never()).deleteAllByUserId(userId);
        verify(refreshTokenRepository, never()).deleteAllByUserId(userId);
        verify(storageService, never()).delete(userId);
        verify(userRepository, never()).save(any());
    }

    @Test
    void deleteAccount_propagatesExceptionFromCascadeStep() {
        User user = makeUserWithId();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(pokRepository.findIdsByUserId(userId)).thenReturn(List.of());
        org.mockito.Mockito.doThrow(new RuntimeException("DB error"))
            .when(userTagRepository).deleteAllByUserId(userId);

        assertThatThrownBy(() -> userService.deleteAccount(userId))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("DB error");
    }
}
