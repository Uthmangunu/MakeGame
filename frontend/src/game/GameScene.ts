import Phaser from 'phaser';
import type { Level } from '@shared/types';
import { gameState } from './gameState';

export class GameScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Sprite | Phaser.GameObjects.Circle;
    private playerEmoji!: Phaser.GameObjects.Text;
    private playerShadow!: Phaser.GameObjects.Rectangle;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    };
    private currentLevel!: Level;
    private tileSize = 32;
    private playerGridPos = { x: 1, y: 1 };
    private isMoving = false;
    private moveDelay = 150; // ms
    private lastMoveTime = 0;
    private facingDirection: { dx: number, dy: number } = { dx: 0, dy: 1 }; // Start facing down
    private highlightGraphics!: Phaser.GameObjects.Graphics;
    private facingIndicator!: Phaser.GameObjects.Triangle;

    // Dynamic asset URLs (passed from game metadata)
    private heroSpriteUrl?: string;
    private villainSpriteUrl?: string;
    private useSprites = false; // Flag to determine if we use sprites or fallback to emojis

    constructor() {
        super('GameScene');
    }

    init(data?: { heroSpriteUrl?: string; villainSpriteUrl?: string }) {
        // Get current level from state
        const level = gameState.getCurrentLevel();
        if (!level) {
            throw new Error("No level loaded in GameState");
        }
        this.currentLevel = level;

        // Store asset URLs if provided
        if (data) {
            this.heroSpriteUrl = data.heroSpriteUrl;
            this.villainSpriteUrl = data.villainSpriteUrl;
            this.useSprites = !!(data.heroSpriteUrl || data.villainSpriteUrl);
        }
    }

    preload() {
        // Dynamically load sprite assets if provided
        if (this.heroSpriteUrl) {
            console.log('Loading hero sprite from:', this.heroSpriteUrl);
            this.load.image('hero_sprite', this.heroSpriteUrl);
        }
        if (this.villainSpriteUrl) {
            console.log('Loading villain sprite from:', this.villainSpriteUrl);
            this.load.image('villain_sprite', this.villainSpriteUrl);
        }
    }

    create() {
        this.createMap();
        this.createPlayer();
        this.createInput();
        this.createHighlight();
        this.createFacingIndicator();

        // Camera follow
        this.cameras.main.startFollow(this.player, true);
        this.cameras.main.setZoom(1.5);
    }

    update(time: number, _delta: number) {
        if (this.isMoving) return;

        // Simple cooldown
        if (time - this.lastMoveTime < this.moveDelay) return;

        let dx = 0;
        let dy = 0;

        // Check arrow keys
        if (this.cursors.left.isDown) dx = -1;
        else if (this.cursors.right.isDown) dx = 1;
        else if (this.cursors.up.isDown) dy = -1;
        else if (this.cursors.down.isDown) dy = 1;

        // Check WASD keys
        if (this.wasd.A.isDown) dx = -1;
        else if (this.wasd.D.isDown) dx = 1;
        else if (this.wasd.W.isDown) dy = -1;
        else if (this.wasd.S.isDown) dy = 1;

        if (this.cursors.space.isDown) {
            if (time - this.lastMoveTime > 200) { // Debounce
                this.handleInteraction();
                this.lastMoveTime = time;
            }
        }

        if (dx !== 0 || dy !== 0) {
            this.attemptMove(dx, dy);
            this.lastMoveTime = time;
        }

        // Update interaction highlight
        this.updateInteractionHighlight();
        // Update facing indicator
        this.updateFacingIndicator();
    }

    private createMap() {
        const { map, width, height, tileset } = this.currentLevel;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const tileCode = map[y][x];
                const tileDef = tileset[tileCode];

                const centerX = x * this.tileSize + this.tileSize / 2;
                const centerY = y * this.tileSize + this.tileSize / 2;

                let color = 0xE8E8E8; // Light gray floor
                let borderColor = 0x999999;
                let emoji = '';
                let label = '';

                if (tileDef?.type === 'wall') {
                    color = 0x2C2C2C; // Dark gray walls
                    borderColor = 0x000000;
                } else if (tileDef?.type === 'floor') {
                    color = 0xD4D4D4; // Floor
                    borderColor = 0xAAAAAA;
                } else if (tileDef?.type === 'door') {
                    color = 0x8B4513; // Brown door
                    borderColor = 0x5C2E0A;
                    emoji = '🚪';
                } else if (tileDef?.type === 'npc') {
                    color = 0xFF6B6B; // Red for NPCs
                    borderColor = 0xCC0000;
                    emoji = '👤';
                    label = tileDef.label || 'NPC';
                } else if (tileDef?.type === 'item') {
                    color = 0xFFD93D; // Gold for items
                    borderColor = 0xFFA500;
                    emoji = '✨';
                    label = tileDef.label || 'Item';
                }

                // Draw shadow
                this.add.rectangle(
                    centerX + 2,
                    centerY + 2,
                    this.tileSize - 4,
                    this.tileSize - 4,
                    0x000000,
                    0.2
                );

                // Draw main tile
                const tile = this.add.rectangle(
                    centerX,
                    centerY,
                    this.tileSize - 4,
                    this.tileSize - 4,
                    color
                ).setStrokeStyle(2, borderColor);

                // Add emoji icon for special tiles
                if (emoji) {
                    this.add.text(centerX, centerY - 8, emoji, {
                        fontSize: '24px',
                        fontFamily: 'Arial'
                    }).setOrigin(0.5);
                }

                // Add label for NPCs and items
                if (label) {
                    this.add.text(centerX, centerY + 12, label, {
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        color: '#000000',
                        backgroundColor: '#FFFFFF',
                        padding: { x: 2, y: 1 }
                    }).setOrigin(0.5);
                }
            }
        }
    }

    private createPlayer() {
        const startPos = this.currentLevel.spawnPoints[this.currentLevel.defaultSpawnPointId];
        this.playerGridPos = { ...startPos };

        const centerX = startPos.x * this.tileSize + this.tileSize / 2;
        const centerY = startPos.y * this.tileSize + this.tileSize / 2;

        // Player shadow
        this.playerShadow = this.add.rectangle(
            centerX + 2,
            centerY + 2,
            this.tileSize * 0.7,
            this.tileSize * 0.7,
            0x000000,
            0.3
        ).setDepth(1);

        // Use sprite if available, otherwise fallback to emoji
        if (this.useSprites && this.heroSpriteUrl && this.textures.exists('hero_sprite')) {
            // Create sprite-based player
            this.player = this.add.sprite(centerX, centerY, 'hero_sprite');
            this.player.setDisplaySize(this.tileSize, this.tileSize);
            this.player.setDepth(2);
            console.log('✅ Using hero sprite');
        } else {
            // Fallback to emoji-based player
            this.player = this.add.circle(
                centerX,
                centerY,
                this.tileSize * 0.35,
                0x00FF88
            ).setStrokeStyle(3, 0x00AA55).setDepth(2);

            // Player emoji/icon
            this.playerEmoji = this.add.text(centerX, centerY, '😊', {
                fontSize: '28px',
                fontFamily: 'Arial'
            }).setOrigin(0.5).setDepth(3);
            console.log('⚠️ Using fallback emoji player');
        }
    }

    private createInput() {
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            // Add WASD keys
            this.wasd = {
                W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
            };
        }
    }

    private attemptMove(dx: number, dy: number) {
        const newX = this.playerGridPos.x + dx;
        const newY = this.playerGridPos.y + dy;

        // Track facing direction
        this.facingDirection = { dx, dy };

        // Boundary check
        if (newX < 0 || newX >= this.currentLevel.width || newY < 0 || newY >= this.currentLevel.height) {
            return;
        }

        // Collision check
        const tileCode = this.currentLevel.map[newY][newX];
        const tileDef = this.currentLevel.tileset[tileCode];

        if (tileDef?.type === 'wall') {
            return; // Blocked
        }

        // Move
        this.playerGridPos = { x: newX, y: newY };
        const targetX = newX * this.tileSize + this.tileSize / 2;
        const targetY = newY * this.tileSize + this.tileSize / 2;

        // Animate player body
        this.tweens.add({
            targets: this.player,
            x: targetX,
            y: targetY,
            duration: 100,
            onComplete: () => {
                this.checkTileEvents(newX, newY);
            }
        });

        // Animate player emoji (only if using emoji mode)
        if (this.playerEmoji) {
            this.tweens.add({
                targets: this.playerEmoji,
                x: targetX,
                y: targetY,
                duration: 100
            });
        }

        // Animate player shadow
        this.tweens.add({
            targets: this.playerShadow,
            x: targetX + 2,
            y: targetY + 2,
            duration: 100
        });
    }

    private checkTileEvents(x: number, y: number) {
        const tileCode = this.currentLevel.map[y][x];
        const tileDef = this.currentLevel.tileset[tileCode];

        if (tileDef?.type === 'door' && tileDef.doorTargetLevelId) {
            console.log(`Door hit! Going to ${tileDef.doorTargetLevelId}`);
            this.game.events.emit('switchLevel', {
                targetLevelId: tileDef.doorTargetLevelId,
                targetSpawnPointId: tileDef.doorTargetSpawnPointId
            });
        }

        // Check for on_step interactions
        const interaction = this.currentLevel.interactions[tileCode.toString()];
        if (interaction && interaction.trigger === 'on_step') {
            this.executeInteraction(interaction);
        }
    }

    private handleInteraction() {
        // Calculate target tile position (tile in front of player)
        const targetX = this.playerGridPos.x + this.facingDirection.dx;
        const targetY = this.playerGridPos.y + this.facingDirection.dy;

        // Boundary check
        if (targetX < 0 || targetX >= this.currentLevel.width ||
            targetY < 0 || targetY >= this.currentLevel.height) {
            return;
        }

        // Get tile code at target position
        const tileCode = this.currentLevel.map[targetY][targetX];
        const tileDef = this.currentLevel.tileset[tileCode];

        // Look up interaction for this tile
        const interaction = this.currentLevel.interactions[tileCode.toString()];

        if (interaction) {
            // Check if trigger type is appropriate for manual interaction
            if (interaction.trigger === 'on_talk' || interaction.trigger === 'on_use') {
                this.executeInteraction(interaction);
            }
        } else {
            // No interaction on this tile
            console.log(`No interaction available on tile ${tileCode} (${tileDef?.label || 'unknown'})`);
        }
    }

    private executeInteraction(interaction: any) {
        let dialogueText = '';
        let shouldProceed = true;

        // Check requirement flag if specified
        if (interaction.requirementFlag !== undefined) {
            const requiredValue = interaction.requirementValue !== undefined ? interaction.requirementValue : true;
            const actualValue = gameState.getFlag(interaction.requirementFlag);

            if (actualValue === requiredValue) {
                // Requirement met - use success dialogue
                dialogueText = interaction.successDialogue || interaction.dialogue || '';
            } else {
                // Requirement not met - use failure dialogue
                dialogueText = interaction.failureDialogue || interaction.dialogue || '';

                // If there's a failure dialogue, don't execute effects
                if (interaction.failureDialogue) {
                    shouldProceed = false;
                }
            }
        } else {
            // No requirement - use default dialogue
            dialogueText = interaction.dialogue || interaction.message || '';
        }

        // Execute effects if allowed
        if (shouldProceed) {
            // Set flag
            if (interaction.setFlag) {
                const flagValue = interaction.setFlagValue !== undefined ? interaction.setFlagValue : true;
                gameState.setFlag(interaction.setFlag, flagValue);
                gameState.saveToLocalStorage(); // Auto-save on flag change
            }

            // Give item
            if (interaction.giveItemFlag) {
                gameState.setFlag(interaction.giveItemFlag, true);
                gameState.addItem(interaction.giveItemFlag, 1);
                // Emit item received event for UI notification
                this.game.events.emit('itemReceived', { itemId: interaction.giveItemFlag });
                gameState.saveToLocalStorage(); // Auto-save on item pickup
            }

            // Unlock door (change tile type)
            if (interaction.unlockDoorTileCode !== undefined) {
                // TODO: Implement tile transformation
                console.log(`Unlocking door with tile code ${interaction.unlockDoorTileCode}`);
            }
        }

        // Emit dialogue event to React UI
        if (dialogueText) {
            this.game.events.emit('interaction', { message: dialogueText });
        }
    }

    private createHighlight() {
        this.highlightGraphics = this.add.graphics();
        this.highlightGraphics.setDepth(10); // Above tiles
    }

    private createFacingIndicator() {
        // Create a small triangle to show facing direction
        this.facingIndicator = this.add.triangle(
            0, 0,
            0, -8,    // Top point
            -6, 6,    // Bottom left
            6, 6,     // Bottom right
            0x00ff00  // Green to match player
        );
        this.facingIndicator.setDepth(11); // Above highlight
    }

    private updateInteractionHighlight() {
        // Clear previous highlight
        this.highlightGraphics.clear();

        // Calculate target tile position
        const targetX = this.playerGridPos.x + this.facingDirection.dx;
        const targetY = this.playerGridPos.y + this.facingDirection.dy;

        // Boundary check
        if (targetX < 0 || targetX >= this.currentLevel.width ||
            targetY < 0 || targetY >= this.currentLevel.height) {
            return;
        }

        // Get tile code at target position
        const tileCode = this.currentLevel.map[targetY][targetX];
        const interaction = this.currentLevel.interactions[tileCode.toString()];

        // Highlight if there's an interactable object
        if (interaction && (interaction.trigger === 'on_talk' || interaction.trigger === 'on_use')) {
            const worldX = targetX * this.tileSize;
            const worldY = targetY * this.tileSize;

            this.highlightGraphics.lineStyle(3, 0x00D1FF, 1); // Cyan outline
            this.highlightGraphics.strokeRect(worldX, worldY, this.tileSize, this.tileSize);
        }
    }

    private updateFacingIndicator() {
        // Position the triangle based on facing direction
        const playerX = this.playerGridPos.x * this.tileSize + this.tileSize / 2;
        const playerY = this.playerGridPos.y * this.tileSize + this.tileSize / 2;

        let offsetX = 0;
        let offsetY = 0;
        let rotation = 0;

        if (this.facingDirection.dx === 1) {
            // Facing right
            offsetX = this.tileSize * 0.5;
            rotation = Math.PI / 2;
        } else if (this.facingDirection.dx === -1) {
            // Facing left
            offsetX = -this.tileSize * 0.5;
            rotation = -Math.PI / 2;
        } else if (this.facingDirection.dy === 1) {
            // Facing down
            offsetY = this.tileSize * 0.5;
            rotation = Math.PI;
        } else if (this.facingDirection.dy === -1) {
            // Facing up
            offsetY = -this.tileSize * 0.5;
            rotation = 0;
        }

        this.facingIndicator.setPosition(playerX + offsetX, playerY + offsetY);
        this.facingIndicator.setRotation(rotation);
    }
}
