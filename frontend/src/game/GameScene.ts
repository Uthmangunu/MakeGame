import Phaser from 'phaser';
import type { Level } from '@shared/types';
import { MOCK_LEVEL } from './mockData';

export class GameScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Rectangle;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private currentLevel: Level = MOCK_LEVEL;
    private tileSize = 32;
    private playerGridPos = { x: 1, y: 1 };
    private isMoving = false;
    private moveDelay = 150; // ms
    private lastMoveTime = 0;

    constructor() {
        super('GameScene');
    }

    preload() {
        // Load assets here if needed
    }

    create() {
        this.createMap();
        this.createPlayer();
        this.createInput();

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

        if (this.cursors.left.isDown) dx = -1;
        else if (this.cursors.right.isDown) dx = 1;
        else if (this.cursors.up.isDown) dy = -1;
        else if (this.cursors.down.isDown) dy = 1;

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
    }

    private createMap() {
        const { map, width, height, tileset } = this.currentLevel;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const tileCode = map[y][x];
                const tileDef = tileset[tileCode];

                let color = 0xffffff; // Default floor
                if (tileDef?.type === 'wall') color = 0x000000;
                else if (tileDef?.type === 'floor') color = 0x888888;

                // Draw tile
                this.add.rectangle(
                    x * this.tileSize + this.tileSize / 2,
                    y * this.tileSize + this.tileSize / 2,
                    this.tileSize,
                    this.tileSize,
                    color
                ).setStrokeStyle(1, 0x444444);
            }
        }
    }

    private createPlayer() {
        const startPos = this.currentLevel.spawnPoints[this.currentLevel.defaultSpawnPointId];
        this.playerGridPos = { ...startPos };

        this.player = this.add.rectangle(
            startPos.x * this.tileSize + this.tileSize / 2,
            startPos.y * this.tileSize + this.tileSize / 2,
            this.tileSize * 0.8,
            this.tileSize * 0.8,
            0x00ff00
        );
    }

    private createInput() {
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }
    }

    private attemptMove(dx: number, dy: number) {
        const newX = this.playerGridPos.x + dx;
        const newY = this.playerGridPos.y + dy;

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
        this.tweens.add({
            targets: this.player,
            x: newX * this.tileSize + this.tileSize / 2,
            y: newY * this.tileSize + this.tileSize / 2,
            duration: 100,
            onComplete: () => {
                // Trigger on_step events here later
            }
        });
    }

    private handleInteraction() {
        // Get tile in front of player based on last move direction (or just check all neighbors? Spec says "in front")
        // For MVP, let's just check the tile we are ON or maybe we need to track facing direction.
        // Spec: "Look at tile in front of player." -> Need facing direction.

        // Let's add facing direction tracking.
        // For now, let's just check if there is an interaction on the current tile (on_step) or neighbor?
        // Actually, usually "talk" implies facing.
        // Let's assume we face the last moved direction.

        // TODO: Implement facing direction. For now, let's just log "Interact"
        console.log("Interact triggered");
        this.game.events.emit('interaction', { message: "You interact with the void." });
    }
}
