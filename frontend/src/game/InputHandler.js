export class InputHandler {
  constructor() {
    this.keys = {};
    this.mousePos = { x: 0, y: 0 };
    this.mouseButtons = {};
    
    // Bind methods to preserve context
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
  }

  setupEventListeners() {
    // Keyboard events
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    
    // Mouse events
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('contextmenu', this.handleContextMenu);
    
    // Prevent default behavior for game keys
    this.preventDefaultKeys = [
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'KeyW', 'KeyA', 'KeyS', 'KeyD',
      'KeyE', 'KeyF', 'KeyR', 'KeyT',
      'Space', 'Escape'
    ];
  }

  handleKeyDown(event) {
    const key = event.code;
    
    // Prevent default behavior for game keys
    if (this.preventDefaultKeys.includes(key)) {
      event.preventDefault();
    }
    
    this.keys[key] = true;
    
    // Handle special key combinations
    if (event.ctrlKey && key === 'KeyR') {
      // Prevent page reload
      event.preventDefault();
    }
  }

  handleKeyUp(event) {
    const key = event.code;
    this.keys[key] = false;
  }

  handleMouseMove(event) {
    this.mousePos.x = event.clientX;
    this.mousePos.y = event.clientY;
  }

  handleMouseDown(event) {
    this.mouseButtons[event.button] = true;
  }

  handleMouseUp(event) {
    this.mouseButtons[event.button] = false;
  }

  handleContextMenu(event) {
    // Prevent right-click context menu
    event.preventDefault();
  }

  cleanup() {
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('contextmenu', this.handleContextMenu);
  }

  // Getter methods for checking input state
  isKeyPressed(key) {
    return this.keys[key] || false;
  }

  isMouseButtonPressed(button) {
    return this.mouseButtons[button] || false;
  }

  getKeys() {
    return { ...this.keys };
  }

  getMousePosition() {
    return { ...this.mousePos };
  }

  // Helper methods for common game inputs
  isMovingUp() {
    return this.keys['ArrowUp'] || this.keys['KeyW'];
  }

  isMovingDown() {
    return this.keys['ArrowDown'] || this.keys['KeyS'];
  }

  isMovingLeft() {
    return this.keys['ArrowLeft'] || this.keys['KeyA'];
  }

  isMovingRight() {
    return this.keys['ArrowRight'] || this.keys['KeyD'];
  }

  isInteracting() {
    return this.keys['KeyE'];
  }

  isUsingSpecial() {
    return this.keys['KeyF'];
  }

  isJumping() {
    return this.keys['Space'];
  }

  isMenuToggle() {
    return this.keys['Escape'];
  }

  isRunning() {
    return this.keys['ShiftLeft'] || this.keys['ShiftRight'];
  }

  // Input buffering for precise controls
  bufferInput(key, duration = 200) {
    if (this.keys[key]) {
      setTimeout(() => {
        this.keys[key] = false;
      }, duration);
    }
  }

  // Get movement vector
  getMovementVector() {
    const vector = { x: 0, y: 0 };
    
    if (this.isMovingUp()) vector.y -= 1;
    if (this.isMovingDown()) vector.y += 1;
    if (this.isMovingLeft()) vector.x -= 1;
    if (this.isMovingRight()) vector.x += 1;
    
    // Normalize diagonal movement
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (length > 0) {
      vector.x /= length;
      vector.y /= length;
    }
    
    return vector;
  }

  // Get player direction based on input
  getDirection() {
    if (this.isMovingUp()) return 0;
    if (this.isMovingRight()) return 1;
    if (this.isMovingDown()) return 2;
    if (this.isMovingLeft()) return 3;
    return -1; // No movement
  }

  // Check for action keys (single press)
  wasKeyJustPressed(key) {
    // This would require tracking previous frame state
    // For now, just return current state
    return this.keys[key];
  }

  // Virtual gamepad support for mobile
  setupVirtualGamepad() {
    // This would create on-screen controls for mobile devices
    // Implementation would depend on specific mobile UI requirements
  }
}