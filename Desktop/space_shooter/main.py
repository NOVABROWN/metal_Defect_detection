import pygame
import random
import sys
import math
import numpy as np
import json
import os
from enum import Enum

# Initialize Pygame
pygame.init()
pygame.mixer.init()

# Screen dimensions
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 100, 255)
YELLOW = (255, 255, 0)
DARK_GRAY = (50, 50, 50)
ORANGE = (255, 165, 0)
PURPLE = (128, 0, 128)
CYAN = (0, 255, 255)

# High Score Manager
class HighScoreManager:
    def __init__(self, filename="highscores.json"):
        self.filename = filename
        self.scores = []
        self.load_scores()

    def load_scores(self):
        """Load high scores from file"""
        if os.path.exists(self.filename):
            try:
                with open(self.filename, 'r') as f:
                    data = json.load(f)
                    self.scores = data.get('scores', [])
            except:
                self.scores = []
        else:
            self.scores = []

    def save_scores(self):
        """Save high scores to file"""
        try:
            with open(self.filename, 'w') as f:
                json.dump({'scores': self.scores}, f, indent=2)
        except:
            pass

    def add_score(self, score, level):
        """Add a new score and sort"""
        self.scores.append({
            'score': score,
            'level': level,
            'timestamp': str(pygame.time.get_ticks())
        })
        # Sort by score descending
        self.scores.sort(key=lambda x: x['score'], reverse=True)
        # Keep only top 10
        self.scores = self.scores[:10]
        self.save_scores()

    def get_top_scores(self, count=10):
        """Get top N scores"""
        return self.scores[:count]

    def is_high_score(self, score):
        """Check if score is in top 10"""
        if len(self.scores) < 10:
            return True
        return score > self.scores[-1]['score']

# Game states
class GameState(Enum):
    MENU = 1
    PLAYING = 2
    PAUSED = 3
    GAME_OVER = 4

# Sound Effects Generator
class SoundManager:
    def __init__(self):
        self.shoot_sound = self.generate_beep(200, 50)
        self.explosion_sound = self.generate_explosion(100, 150)
        self.boss_spawn_sound = self.generate_beep(300, 200)
        self.hit_sound = self.generate_beep(100, 100)

    @staticmethod
    def generate_beep(frequency, duration_ms):
        """Generate a simple beep sound"""
        sample_rate = 22050
        frames = int(sample_rate * duration_ms / 1000)
        
        arr = np.array([int(32767.0 * 0.3 * math.sin(2.0 * math.pi * frequency * x / sample_rate)) for x in range(frames)], dtype=np.int16)
        # Make stereo (2 channels)
        stereo = np.zeros((arr.shape[0], 2), dtype=np.int16)
        stereo[:, 0] = arr
        stereo[:, 1] = arr
        
        sound = pygame.sndarray.make_sound(stereo)
        return sound

    @staticmethod
    def generate_explosion(freq_start, freq_end):
        """Generate an explosion-like sound"""
        sample_rate = 22050
        duration_ms = 150
        frames = int(sample_rate * duration_ms / 1000)
        
        arr = []
        for x in range(frames):
            freq = freq_start - (freq_start - freq_end) * x / frames
            volume = 0.3 * (1 - x / frames)
            sample = int(32767.0 * volume * math.sin(2.0 * math.pi * freq * x / sample_rate))
            arr.append(sample)
        
        arr = np.array(arr, dtype=np.int16)
        # Make stereo (2 channels)
        stereo = np.zeros((arr.shape[0], 2), dtype=np.int16)
        stereo[:, 0] = arr
        stereo[:, 1] = arr
        
        sound = pygame.sndarray.make_sound(stereo)
        return sound

    def play_shoot(self):
        self.shoot_sound.play()

    def play_explosion(self):
        self.explosion_sound.play()

    def play_boss_spawn(self):
        self.boss_spawn_sound.play()

    def play_hit(self):
        self.hit_sound.play()

# Particle Effect
class Particle(pygame.sprite.Sprite):
    def __init__(self, x, y, velocity_x, velocity_y, color, lifetime):
        super().__init__()
        self.x = float(x)
        self.y = float(y)
        self.velocity_x = velocity_x
        self.velocity_y = velocity_y
        self.color = color
        self.lifetime = lifetime
        self.age = 0
        self.size = 5
        
        self.image = pygame.Surface((self.size, self.size))
        self.image.fill(color)
        self.rect = self.image.get_rect(center=(int(self.x), int(self.y)))

    def update(self):
        self.age += 1
        self.x += self.velocity_x
        self.y += self.velocity_y
        self.velocity_y += 0.1  # Gravity effect
        
        # Fade out
        alpha = int(255 * (1 - self.age / self.lifetime))
        self.image = pygame.Surface((self.size, self.size))
        self.image.fill(self.color)
        self.image.set_alpha(alpha)
        self.rect.center = (int(self.x), int(self.y))
        
        if self.age >= self.lifetime:
            self.kill()

class ParticleEffect:
    """Create particle explosions"""
    @staticmethod
    def create_explosion(x, y, num_particles=15, color=YELLOW):
        particles = []
        for _ in range(num_particles):
            angle = random.uniform(0, 2 * math.pi)
            speed = random.uniform(2, 6)
            vx = speed * math.cos(angle)
            vy = speed * math.sin(angle)
            particle = Particle(x, y, vx, vy, color, lifetime=30)
            particles.append(particle)
        return particles

# Player class
class Player(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.width = 50
        self.height = 50
        self.image = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
        self.draw_player()
        self.rect = self.image.get_rect()
        self.rect.centerx = SCREEN_WIDTH // 2
        self.rect.bottom = SCREEN_HEIGHT - 10
        self.speed_x = 0
        self.shoot_cooldown = 0

    def draw_player(self):
        """Draw a detailed player spaceship"""
        # Main body (triangle pointing up)
        points = [
            (self.width // 2, 5),      # Top point
            (self.width - 5, self.height - 5),   # Bottom right
            (self.width // 2, self.height - 15), # Bottom center
            (5, self.height - 5),      # Bottom left
        ]
        pygame.draw.polygon(self.image, GREEN, points)
        
        # Cockpit window
        pygame.draw.circle(self.image, CYAN, (self.width // 2, 15), 5)
        
        # Engine glow
        pygame.draw.rect(self.image, BLUE, (self.width // 2 - 4, self.height - 12, 8, 8))
        pygame.draw.rect(self.image, CYAN, (self.width // 2 - 2, self.height - 10, 4, 6))
        
        # Wing details
        pygame.draw.line(self.image, CYAN, (8, self.height - 15), (15, self.height - 8), 2)
        pygame.draw.line(self.image, CYAN, (self.width - 8, self.height - 15), (self.width - 15, self.height - 8), 2)
        
        # Shield indicator (glowing border)
        pygame.draw.polygon(self.image, (0, 200, 0), points, 2)

    def update(self):
        self.speed_x = 0
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            self.speed_x = -5
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            self.speed_x = 5

        self.rect.x += self.speed_x

        # Boundary checking
        if self.rect.left < 0:
            self.rect.left = 0
        if self.rect.right > SCREEN_WIDTH:
            self.rect.right = SCREEN_WIDTH

        # Shoot cooldown
        if self.shoot_cooldown > 0:
            self.shoot_cooldown -= 1

    def shoot(self):
        if self.shoot_cooldown <= 0:
            bullet = Bullet(self.rect.centerx, self.rect.top)
            all_sprites.add(bullet)
            bullets.add(bullet)
            self.shoot_cooldown = 10
            game.sound_manager.play_shoot()

    def draw_health(self, surface):
        font = pygame.font.Font(None, 24)
        health_text = font.render(f"Lives: {game.lives}", True, GREEN)
        surface.blit(health_text, (10, 10))


# Enemy class
class Enemy(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.width = 40
        self.height = 40
        self.enemy_type = random.choice(['drone', 'fighter', 'scout'])
        self.image = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
        self.draw_enemy()
        self.rect = self.image.get_rect()
        self.rect.x = random.randint(0, SCREEN_WIDTH - self.rect.width)
        self.rect.y = random.randint(-100, -40)
        self.speed_y = random.randint(1, 3)
        self.speed_x = random.randint(-2, 2)
        self.animation_frame = 0

    def draw_enemy(self):
        """Draw different types of creative enemy ships"""
        if self.enemy_type == 'drone':
            # Spherical drone with tentacles
            pygame.draw.circle(self.image, RED, (self.width // 2, self.height // 2), 12)
            pygame.draw.circle(self.image, (255, 100, 100), (self.width // 2, self.height // 2), 10)
            # Tentacles
            pygame.draw.line(self.image, RED, (self.width // 2 - 10, self.height // 2), (5, self.height), 2)
            pygame.draw.line(self.image, RED, (self.width // 2 + 10, self.height // 2), (self.width - 5, self.height), 2)
            # Eye
            pygame.draw.circle(self.image, YELLOW, (self.width // 2, self.height // 2 - 3), 2)
            
        elif self.enemy_type == 'fighter':
            # Angular fighter ship
            points = [
                (self.width // 2, 5),
                (self.width - 5, self.height // 2),
                (self.width - 8, self.height),
                (self.width // 2, self.height - 8),
                (8, self.height),
                (5, self.height // 2),
            ]
            pygame.draw.polygon(self.image, RED, points)
            pygame.draw.polygon(self.image, (255, 100, 100), points, 2)
            # Cockpit
            pygame.draw.circle(self.image, YELLOW, (self.width // 2, self.height // 2), 3)
            
        else:  # scout
            # Sleek scout ship
            pygame.draw.polygon(self.image, RED, [
                (self.width // 2, 3),
                (self.width - 3, self.height - 10),
                (self.width // 2, self.height - 3),
                (3, self.height - 10),
            ])
            # Speed stripes
            pygame.draw.line(self.image, ORANGE, (5, self.height - 15), (8, self.height - 10), 1)
            pygame.draw.line(self.image, ORANGE, (self.width - 5, self.height - 15), (self.width - 8, self.height - 10), 1)

    def update(self):
        self.rect.y += self.speed_y
        self.rect.x += self.speed_x
        self.animation_frame += 1

        # Boundary wrapping for x
        if self.rect.left < 0:
            self.rect.right = SCREEN_WIDTH
        if self.rect.right > SCREEN_WIDTH:
            self.rect.left = 0

        # Remove if off screen
        if self.rect.top > SCREEN_HEIGHT:
            self.kill()


# Bullet class
class Bullet(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.Surface((8, 20), pygame.SRCALPHA)
        self.draw_bullet()
        self.rect = self.image.get_rect()
        self.rect.centerx = x
        self.rect.bottom = y
        self.speed_y = -7

    def draw_bullet(self):
        """Draw a detailed energy bolt"""
        # Main energy beam
        pygame.draw.rect(self.image, YELLOW, (2, 2, 4, 16))
        # Core glow
        pygame.draw.rect(self.image, CYAN, (3, 4, 2, 14))
        # Trailing energy
        pygame.draw.line(self.image, (255, 255, 100), (4, 18), (4, 20), 1)

    def update(self):
        self.rect.y += self.speed_y
        if self.rect.bottom < 0:
            self.kill()


# Boss Enemy Class
class Boss(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.width = 100
        self.height = 80
        self.image = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
        self.draw_boss()
        self.rect = self.image.get_rect()
        self.rect.centerx = SCREEN_WIDTH // 2
        self.rect.top = 30
        self.health = 20
        self.max_health = 20
        self.speed_x = 2
        self.direction = 1
        self.shoot_timer = 0
        self.blink_timer = 0
        self.animation_frame = 0

    def draw_boss(self):
        """Draw an impressive boss battleship"""
        # Outer hull (dark purple)
        pygame.draw.polygon(self.image, PURPLE, [
            (self.width // 2, 5),
            (self.width - 8, self.height // 3),
            (self.width - 5, self.height),
            (self.width // 2, self.height - 8),
            (5, self.height),
            (8, self.height // 3),
        ])
        
        # Inner core (red main body)
        pygame.draw.circle(self.image, RED, (self.width // 2, self.height // 2), 18)
        pygame.draw.circle(self.image, (255, 100, 100), (self.width // 2, self.height // 2), 15)
        
        # Energy cores (glowing blue)
        pygame.draw.circle(self.image, BLUE, (self.width // 2 - 12, self.height // 2), 6)
        pygame.draw.circle(self.image, BLUE, (self.width // 2 + 12, self.height // 2), 6)
        pygame.draw.circle(self.image, CYAN, (self.width // 2 - 12, self.height // 2), 3)
        pygame.draw.circle(self.image, CYAN, (self.width // 2 + 12, self.height // 2), 3)
        
        # Main cannon (top center)
        pygame.draw.rect(self.image, RED, (self.width // 2 - 4, 5, 8, 12))
        pygame.draw.circle(self.image, YELLOW, (self.width // 2, 8), 3)
        
        # Side cannons
        pygame.draw.circle(self.image, ORANGE, (12, self.height // 2), 5)
        pygame.draw.circle(self.image, ORANGE, (self.width - 12, self.height // 2), 5)
        
        # Armor plating (glowing lines)
        pygame.draw.line(self.image, CYAN, (self.width // 2 - 8, self.height // 2 - 10), (self.width // 2 - 8, self.height // 2 + 10), 2)
        pygame.draw.line(self.image, CYAN, (self.width // 2 + 8, self.height // 2 - 10), (self.width // 2 + 8, self.height // 2 + 10), 2)
        
        # Boss marking
        pygame.draw.polygon(self.image, YELLOW, [
            (self.width // 2 - 3, self.height // 2 - 5),
            (self.width // 2 + 3, self.height // 2 - 5),
            (self.width // 2, self.height // 2 + 3),
        ])

    def update(self):
        # Move side to side
        self.rect.x += self.speed_x * self.direction
        if self.rect.left <= 0 or self.rect.right >= SCREEN_WIDTH:
            self.direction *= -1

        self.shoot_timer += 1
        self.blink_timer += 1

    def get_health_percentage(self):
        return self.health / self.max_health

    def take_damage(self, amount=1):
        self.health -= amount
        self.blink_timer = 10


# Game class
class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("Space Shooter")
        self.clock = pygame.time.Clock()
        self.font_large = pygame.font.Font(None, 74)
        self.font_medium = pygame.font.Font(None, 36)
        self.font_small = pygame.font.Font(None, 24)
        
        self.sound_manager = SoundManager()
        self.high_score_manager = HighScoreManager()
        self.boss = None

        self.reset_game()
        self.state = GameState.MENU
        self.enemy_spawn_timer = 0

    def reset_game(self):
        self.score = 0
        self.lives = 3
        self.level = 1
        self.enemy_spawn_rate = 30
        self.state = GameState.PLAYING
        self.boss = None

    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return False

            if event.type == pygame.KEYDOWN:
                if self.state == GameState.MENU:
                    if event.key == pygame.K_RETURN:
                        self.reset_game()
                        self.state = GameState.PLAYING

                elif self.state == GameState.PLAYING:
                    if event.key == pygame.K_SPACE:
                        player.shoot()
                    if event.key == pygame.K_p:
                        self.state = GameState.PAUSED

                elif self.state == GameState.PAUSED:
                    if event.key == pygame.K_p:
                        self.state = GameState.PLAYING

                elif self.state == GameState.GAME_OVER:
                    if event.key == pygame.K_r:
                        self.high_score_manager.add_score(self.score, self.level)
                        self.reset_game()
                    if event.key == pygame.K_RETURN:
                        self.high_score_manager.add_score(self.score, self.level)
                        self.state = GameState.MENU

        return True

    def update(self):
        if self.state == GameState.PLAYING:
            all_sprites.update()
            particles.update()

            # Spawn boss at certain score thresholds
            if self.boss is None and self.score > 0 and self.score % 200 == 0 and self.score > 0:
                self.boss = Boss()
                all_sprites.add(self.boss)
                bosses.add(self.boss)
                self.level += 1
                self.sound_manager.play_boss_spawn()

            # Spawn regular enemies
            self.enemy_spawn_timer -= 1
            if self.enemy_spawn_timer <= 0:
                enemy = Enemy()
                all_sprites.add(enemy)
                enemies.add(enemy)
                self.enemy_spawn_timer = self.enemy_spawn_rate

            # Check bullet-boss collisions
            if self.boss:
                boss_hits = pygame.sprite.spritecollide(self.boss, bullets, True)
                for hit in boss_hits:
                    self.boss.take_damage(1)
                    self.sound_manager.play_hit()
                    particles.add(*ParticleEffect.create_explosion(self.boss.rect.centerx, self.boss.rect.centery, 10, ORANGE))
                    if self.boss.health <= 0:
                        self.score += 100
                        particles.add(*ParticleEffect.create_explosion(self.boss.rect.centerx, self.boss.rect.centery, 30, PURPLE))
                        self.sound_manager.play_explosion()
                        self.boss.kill()
                        self.boss = None

            # Check bullet-enemy collisions
            collisions = pygame.sprite.groupcollide(enemies, bullets, True, True)
            for collision in collisions:
                self.score += 10
                self.sound_manager.play_explosion()
                particles.add(*ParticleEffect.create_explosion(collision.rect.centerx, collision.rect.centery, 15, RED))
                enemy = Enemy()
                all_sprites.add(enemy)
                enemies.add(enemy)

            # Check player-boss collisions
            if self.boss and pygame.sprite.spritecollide(player, bosses, False):
                self.lives -= 1
                self.sound_manager.play_hit()
                particles.add(*ParticleEffect.create_explosion(player.rect.centerx, player.rect.centery, 20, RED))
                if self.lives <= 0:
                    self.state = GameState.GAME_OVER
                else:
                    self.boss = None

            # Check player-enemy collisions
            hits = pygame.sprite.spritecollide(player, enemies, True)
            for hit in hits:
                self.lives -= 1
                self.sound_manager.play_hit()
                particles.add(*ParticleEffect.create_explosion(hit.rect.centerx, hit.rect.centery, 15, YELLOW))
                if self.lives <= 0:
                    self.state = GameState.GAME_OVER
                else:
                    enemy = Enemy()
                    all_sprites.add(enemy)
                    enemies.add(enemy)

            # Increase difficulty
            if self.score > 0 and self.score % 100 == 0 and self.enemy_spawn_rate > 15:
                self.enemy_spawn_rate -= 1

    def draw_menu(self):
        self.screen.fill(DARK_GRAY)

        # Title
        title = self.font_large.render("SPACE SHOOTER", True, BLUE)
        title_rect = title.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 100))
        self.screen.blit(title, title_rect)

        # Instructions
        instructions = [
            "Use LEFT/RIGHT ARROW or A/D to move",
            "Press SPACE to shoot",
            "Press P to pause",
            "",
            "Press ENTER to start"
        ]

        y_offset = SCREEN_HEIGHT // 2
        for instruction in instructions:
            if instruction:
                text = self.font_small.render(instruction, True, WHITE)
            else:
                text = self.font_small.render("", True, WHITE)
            text_rect = text.get_rect(center=(SCREEN_WIDTH // 2, y_offset))
            self.screen.blit(text, text_rect)
            y_offset += 40
        
        # Draw high scores
        self.draw_high_scores(y_offset + 20)

    def draw_game(self):
        self.screen.fill(BLACK)

        # Draw sprites
        all_sprites.draw(self.screen)
        
        # Draw particles
        particles.draw(self.screen)

        # Draw HUD
        self.draw_hud()

    def draw_hud(self):
        # Score
        score_text = self.font_small.render(f"Score: {self.score}", True, WHITE)
        self.screen.blit(score_text, (10, 10))

        # Lives
        lives_text = self.font_small.render(f"Lives: {self.lives}", True, WHITE)
        self.screen.blit(lives_text, (SCREEN_WIDTH // 2 - 40, 10))

        # Level
        level_text = self.font_small.render(f"Level: {self.level}", True, WHITE)
        self.screen.blit(level_text, (SCREEN_WIDTH - 150, 10))
        
        # Boss health bar
        if self.boss:
            health_bar_width = 200
            health_bar_height = 20
            health_bar_x = SCREEN_WIDTH // 2 - health_bar_width // 2
            health_bar_y = SCREEN_HEIGHT - 40
            
            # Background
            pygame.draw.rect(self.screen, RED, (health_bar_x, health_bar_y, health_bar_width, health_bar_height))
            # Health fill
            health_percentage = self.boss.get_health_percentage()
            pygame.draw.rect(self.screen, GREEN, (health_bar_x, health_bar_y, health_bar_width * health_percentage, health_bar_height))
            # Border
            pygame.draw.rect(self.screen, WHITE, (health_bar_x, health_bar_y, health_bar_width, health_bar_height), 2)
            
            # Boss health text
            boss_text = self.font_small.render("BOSS", True, RED)
            boss_text_rect = boss_text.get_rect(center=(SCREEN_WIDTH // 2, health_bar_y - 20))
            self.screen.blit(boss_text, boss_text_rect)

    def draw_paused(self):
        # Semi-transparent overlay
        overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        overlay.set_alpha(128)
        overlay.fill(BLACK)
        self.screen.blit(overlay, (0, 0))

        # Paused text
        paused_text = self.font_large.render("PAUSED", True, YELLOW)
        paused_rect = paused_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 50))
        self.screen.blit(paused_text, paused_rect)

        # Resume instruction
        resume_text = self.font_small.render("Press P to Resume", True, WHITE)
        resume_rect = resume_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 50))
        self.screen.blit(resume_text, resume_rect)

    def draw_game_over(self):
        self.screen.fill(DARK_GRAY)

        # Game Over text
        game_over_text = self.font_large.render("GAME OVER", True, RED)
        game_over_rect = game_over_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 100))
        self.screen.blit(game_over_text, game_over_rect)

        # Final score
        score_text = self.font_medium.render(f"Final Score: {self.score}", True, WHITE)
        score_rect = score_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2))
        self.screen.blit(score_text, score_rect)

        # Check if high score
        if self.high_score_manager.is_high_score(self.score):
            high_score_text = self.font_small.render("★ NEW HIGH SCORE! ★", True, YELLOW)
            high_score_rect = high_score_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 30))
            self.screen.blit(high_score_text, high_score_rect)

        # Level reached
        level_text = self.font_small.render(f"Level Reached: {self.level}", True, YELLOW)
        level_rect = level_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 60))
        self.screen.blit(level_text, level_rect)

        # Restart instructions
        restart_text = self.font_small.render("Press R to Restart or ENTER for Menu", True, GREEN)
        restart_rect = restart_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 120))
        self.screen.blit(restart_text, restart_rect)
        
        # Draw high scores
        self.draw_high_scores(SCREEN_HEIGHT - 140)

    def draw_high_scores(self, y_start):
        """Draw top 5 high scores"""
        scores = self.high_score_manager.get_top_scores(5)
        
        if not scores:
            no_scores_text = self.font_small.render("No High Scores Yet", True, WHITE)
            no_scores_rect = no_scores_text.get_rect(center=(SCREEN_WIDTH // 2, y_start))
            self.screen.blit(no_scores_text, no_scores_rect)
            return
        
        # Title
        title_text = self.font_small.render("TOP 5 HIGH SCORES", True, YELLOW)
        title_rect = title_text.get_rect(center=(SCREEN_WIDTH // 2, y_start))
        self.screen.blit(title_text, title_rect)
        
        y_offset = y_start + 25
        for idx, score_data in enumerate(scores, 1):
            score = score_data['score']
            level = score_data['level']
            
            # Highlight top score
            color = YELLOW if idx == 1 else WHITE
            score_line = f"{idx}. Score: {score} | Level: {level}"
            score_text = self.font_small.render(score_line, True, color)
            score_rect = score_text.get_rect(center=(SCREEN_WIDTH // 2, y_offset))
            self.screen.blit(score_text, score_rect)
            y_offset += 22

    def draw(self):
        if self.state == GameState.MENU:
            self.draw_menu()
        elif self.state == GameState.PLAYING:
            self.draw_game()
        elif self.state == GameState.PAUSED:
            self.draw_game()
            self.draw_paused()
        elif self.state == GameState.GAME_OVER:
            self.draw_game_over()

        pygame.display.flip()

    def run(self):
        running = True
        while running:
            running = self.handle_events()
            self.update()
            self.draw()
            self.clock.tick(60)

        pygame.quit()
        sys.exit()


# Sprite groups
all_sprites = pygame.sprite.Group()
enemies = pygame.sprite.Group()
bullets = pygame.sprite.Group()
particles = pygame.sprite.Group()
bosses = pygame.sprite.Group()

# Create player
player = Player()
all_sprites.add(player)

# Create game
game = Game()

# Run game
if __name__ == "__main__":
    game.run()
