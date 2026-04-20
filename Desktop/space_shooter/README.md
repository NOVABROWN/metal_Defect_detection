# Space Shooter Game

A professional arcade-style space shooter game built with Python and Pygame. Destroy enemies, battle bosses, and compete for the highest score. Features creative visuals, dynamic particle effects, immersive sound design, and persistent high score tracking.

## ✨ Features

### 🎮 Core Gameplay
✅ **Start Menu** - Clean, intuitive main menu with high score display
✅ **HUD (Heads-Up Display)** - Real-time score, lives, and level indicators
✅ **Pause System** - Press P to pause/resume gameplay at any time
✅ **Game Over Screen** - Final score and high score notifications
✅ **Restart Option** - Quick game restart via R key
✅ **Progressive Difficulty** - Enemy spawn rate increases with score

### 👾 **Enemy Variety**
✅ **3 Unique Enemy Types** - Drone, Fighter, and Scout ships with distinct visuals
✅ **Boss Enemies** - Epic purple battleship spawns every 200 points
✅ **Boss Health Tracking** - Visual health bar during boss battles
✅ **Escalating Challenges** - Difficulty increases with each boss encounter

### ✨ **Visual Design**
✅ **Creative Character Designs** - Detailed, professional sprite artwork
✅ **Player Ship** - Green fighter with cyan cockpit and engine glow
✅ **Enemy Ships** - Each type has unique visual characteristics
✅ **Detailed Boss** - Purple battleship with multiple cannons and energy cores
✅ **Energy Bolt Bullets** - Enhanced projectile visuals with glow effects
✅ **Particle Explosions** - Dynamic particle effects on enemy destruction

### 🔊 **Audio System**
✅ **Sound Effects** - Generated audio for all actions:
  - Shoot sounds (beep)
  - Explosion sounds (frequency sweep)
  - Boss spawn alert
  - Hit/collision sounds
✅ **Stereo Audio** - All sounds play in stereo format
✅ **Dynamic Sound Generation** - Procedurally generated effects

### 🏆 **High Score System**
✅ **Persistent Storage** - High scores saved to `highscores.json`
✅ **Top 10 Leaderboard** - Tracks best performances
✅ **Score Display** - Shows top 5 scores on menu and game over
✅ **New High Score Alert** - Special notification for record scores
✅ **Level Tracking** - Records level reached with each score
✅ **Automatic Sorting** - Scores automatically ranked by value

## 📋 Installation

### Requirements
- Python 3.8 or higher
- Dependencies listed in requirements.txt

### Setup Steps

1. **Install Python** (if not already installed)
   - Download from [python.org](https://www.python.org)

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```
   
   Or install manually:
   ```bash
   pip install --only-binary :all: pygame numpy
   ```

## 🎮 How to Play

### Controls

| Key | Action |
|-----|--------|
| **LEFT ARROW** or **A** | Move Left |
| **RIGHT ARROW** or **D** | Move Right |
| **SPACE** | Shoot |
| **P** | Pause/Resume |
| **R** | Restart Game (from Game Over) |
| **ENTER** | Start Game / Return to Menu |

### Gameplay Mechanics

- **Objective**: Destroy enemy ships to earn points and survive as long as possible
- **Lives System**: Start with 3 lives. Each collision costs 1 life. Game ends at 0 lives
- **Scoring**:
  - Regular enemies: 10 points each
  - Boss enemies: 100 points when defeated
- **Enemy Types**:
  - **Drone** (spherical with tentacles) - Standard threat
  - **Fighter** (angular design) - Aggressive appearance
  - **Scout** (sleek profile) - Fast reconnaissance ship
- **Boss Battles**:
  - Spawns every 200 points
  - Requires 20 hits to defeat
  - Moves side-to-side across screen
  - Health bar displayed at bottom
- **Difficulty Scaling**:
  - Enemy spawn rate increases every 100 points
  - Boss appearances increase level counter
  - Challenge grows exponentially with score

## 🚀 Running the Game

```bash
python main.py
```

## 🎯 Game Flow

```
Start Menu (High Scores) 
    ↓
Press ENTER 
    ↓
Gameplay (Dodge, Shoot, Survive)
    ├→ Press P → Pause Screen
    │            ↓
    │          Press P → Resume
    ↓
Score 200+ → Boss Battle
    ↓
Game Over (High Score Check)
    ↓
Press R (Restart) or ENTER (Menu)
```

## 📊 Game States

1. **MENU** - Main menu with controls, instructions, and top 5 high scores
2. **PLAYING** - Active gameplay with real-time HUD
3. **PAUSED** - Game paused with overlay, press P to resume
4. **GAME_OVER** - End screen with final stats and high score display

## 🏅 High Score System Details

### Storage
- High scores saved in `highscores.json` in the game directory
- Automatically created on first game over
- Persists between game sessions

### Leaderboard Features
- **Top 10 Tracking**: Best 10 scores maintained
- **Menu Display**: Top 5 scores visible on main menu
- **Game Over Display**: Top 5 scores shown when game ends
- **New Record Alert**: "★ NEW HIGH SCORE! ★" notification appears
- **Score Metadata**: Stores score value, level reached, and timestamp

### Data Format
```json
{
  "scores": [
    {
      "score": 1500,
      "level": 8,
      "timestamp": "1234567890"
    }
  ]
}
```

## 💡 Strategy Tips

### Scoring
- Destroy enemies consistently for steady 10-point gains
- Defeat bosses for massive 100-point bonuses
- Higher scores unlock faster gameplay and boss battles

### Survival
- Maintain constant movement to avoid collisions
- Position near screen center for maximum maneuverability
- Watch for enemy patterns and anticipate movement
- Use the full width of the screen for dodging

### Boss Battles
- Keep moving to avoid boss projectiles (if implemented)
- Aim carefully - each hit counts toward the 20 needed
- Watch the health bar to track progress
- Move strategically during multi-cannon attacks

## 🔧 Technical Details

### System Requirements
- **Resolution**: 800x600 pixels
- **FPS**: 60 frames per second (consistent gameplay)
- **Framework**: Pygame 2.6.1+
- **Language**: Python 3.8+
- **Dependencies**: NumPy (for sound generation)

### Performance
- Optimized sprite rendering
- Efficient collision detection
- Minimal CPU usage (typically <20%)
- Smooth 60 FPS on most systems

### Code Architecture
- Object-oriented design with Sprite classes
- Modular sound management system
- Persistent high score manager
- State-based game flow
- Particle effect system

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Game won't start | Ensure Python 3.8+ and all dependencies installed: `pip install -r requirements.txt` |
| "No module named pygame" | Install pygame: `pip install pygame` |
| "No module named numpy" | Install numpy: `pip install numpy` |
| Game runs slowly | Close other applications, ensure dedicated GPU if available |
| Controls unresponsive | Click on game window to focus it |
| Sound issues | Check system volume, verify NumPy installation |
| High scores not saving | Ensure write permissions in game directory |

## 📁 Project Structure

```
space_shooter/
├── main.py              # Main game file
├── requirements.txt     # Python dependencies
├── README.md           # This file
├── highscores.json     # High scores database (auto-generated)
└── .gitignore          # Git ignore file
```

## 🎓 Learning Resources

This project demonstrates:
- Game development with Pygame
- Object-oriented programming in Python
- Collision detection algorithms
- Particle system implementation
- Audio synthesis and playback
- Data persistence with JSON
- Game state management
- UI/UX design principles

## 🚀 Future Enhancement Ideas

Potential features for future versions:
- Background music loop with in-game soundtrack
- Power-up system (shields, rapid-fire, invincibility)
- Special weapon types and projectiles
- Multiple difficulty modes (Easy/Normal/Hard)
- Player name entry for personalized high scores
- Advanced statistics tracking (games played, total kills, etc.)
- Combo system with multiplier bonuses
- Screen shake effects on explosions
- Animated boss attack patterns
- Leaderboard networking (online scores)
- Achievements and badges
- Configuration menu (volume, difficulty)

## 📝 Version History

### v1.0 (Current)
- ✅ Core gameplay with 3 enemy types
- ✅ Boss enemy system
- ✅ Creative visual characters
- ✅ Particle explosion effects
- ✅ Dynamic sound effects
- ✅ High score persistence
- ✅ Professional UI/UX

## 🤝 Contributing

Feel free to fork, modify, and enhance this game! Some areas for contribution:
- Additional enemy types
- New weapon types
- Enhanced visual effects
- Performance optimizations
- Additional game modes

## 📄 License

This project is open source and available for personal and educational use.

## 👾 Credits

Built with:
- **Pygame** - Game framework
- **NumPy** - Audio generation
- **Python** - Programming language

---

**Enjoy the game and compete for the highest score! 🎮🚀**

*Last Updated: April 20, 2026*
