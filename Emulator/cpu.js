class Chip8{
  /**
   * @constructor
   */
  constructor(){
    this.memory = new Uint8Array(4096);
    this.stack = new Array(16);
    this.register = new Array(16);
    this.delayTimer = 0;
    this.soundTimer = 0;
    this.pc = 0x200; // Program Counter
  }

  /**
   * @method loadProgram
   * @param {Array} program 
   * Responsible for loading program into the memory
   */
  loadProgram(program){
    for(var i = 0; i < program.length;i++){
      this.memory[i+0x200] = program[i];
    }
  }

  /**
   * @method loadCharacters
   * Loads all the required fonts into the memory
   */
  loadCharacters(){
    var hexchrs = [
        0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
        0x20, 0x60, 0x20, 0x20, 0x70, // 1
        0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
        0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
        0x90, 0x90, 0xF0, 0x10, 0x10, // 4
        0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
        0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
        0xF0, 0x10, 0x20, 0x40, 0x40, // 7
        0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
        0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
        0xF0, 0x90, 0xF0, 0x90, 0x90, // A
        0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
        0xF0, 0x80, 0x80, 0x80, 0xF0, // C
        0xE0, 0x90, 0x90, 0x90, 0xE0, // D
        0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
        0xF0, 0x80, 0xF0, 0x80, 0x80  // F
      ];

    for(var i = 0; i<hexchrs.length;i++){
      this.memory[i] = hexchrs[i];
    }
  }

  /**
   * @method reset
   * Reset all the values to default
   */
  reset(){
    this.register = new Array(16);

    this.memory = new Uint8Array(4096);
    this.loadCharacters();

    this.stack = new Array(16);
    this.delayTimer = 0;
    this.soundTimer = 0;
    this.pc = 0x200;
  }

  /**
   * @method emulatorCycle
   * Method for runnning CPU cycle 
   */
  emulatorCycle(){
    for(var i = 0; i <10; i++){
      var opcode = this.memory[this.pc] << 8 | this.memory[this.pc+1];
      this.oneCycle(opcode);
    }
  }

  /**
   * @method oneCycle
   * @param {Integer} opcode
   * This method runs takes opcode as input
   * and run one cycle of Chip8 CPU 
   */
  oneCycle(opcode) {
    switch (opcode >> 12) { //first digit of opcode
        case 0x0: //opcodes that start with 0
            if ((opcode & 0x0FFF) === 0x0E0) { //opcode 0x00E0 --> CLS -- Clear the display // works
                for (let i = 0; i < graphics.length; i++) {
                    graphics[i] = 0;
                }
                drawFlag = true;
            }
            else if ((opcode & 0x0FFF) === 0x00EE) { //opcode 0x00EE --> RET
                programCounter = stack[stackPointer]; //sets the program counter to the address at the top of the stack
                stackPointer--;//then substracts 1 from the stack pointer
            }
            break;
        
        case 0x1: //opcode 0x1nnn --> JMP addr -- jump to location nnn
            tempVal = opcode & 0x0FFF;
            programCounter = value; //sets program counter to address nnn
            break;
        
        case 0x2: //opcode 0x2nnn --> Call addr -- call subroutine at address nnn
            stackPointer++; //increment stack pointer
            stack[stackPointer] = programCounter;
            programCounter = opcode & 0x0FFF;
            console.log("nnn = " + programCounter);
            break;
        
        case 0x3: //opcode 0x3xkk --> SE Vx, byte -- if this.register Vx == kk, skip next instruction (PC + 2)
            reg1= opcode & 0x0F00;
            reg1 = reg1 >> 8; //this.register number = x
            tempVal = opcode & 0x00FF; //kk == last 2 digits of opcode
            if (this.register[reg1] === tempVal) { //skips next instruction if this.register Vx == kk
               programCounter += 2;
            }
            break;
        
        case 0x4: //opcode 0x3xkk --> SNE Vx, byte -- if this.register Vx != kk, skip next instruction (PC + 2)
            reg1 = opcode & 0x0F00;
            reg1 = reg1 >> 8; //this.register number =  x
            tempVal = opcode & 0x00FF; //kk == last 2 digits of opcode
            if (this.register[reg1] !== tempVal) { //skips next instruction if this.register Vx != kk
                console.log("skips next instruction !=");
                programCounter += 2;
            }
            break;
        
        case 0x5: //opcode 0x5xy0 --> SE Vx, Vy -- if this.register Vx & Vy are equal, skip next instruction
            reg1 = opcode & 0x0F00;
            reg1 = reg1 >> 8; // reg1 = x
            reg2 = opcode & 0x00F0;
            reg2 = reg2 >> 4; // reg2 = y
            if (this.register[reg1] === this.register[reg2]) {
                console.log("Skips cause regs are equal");
                programCounter += 2;
            }
            break;
        
        case 0x6: //opcode 0x6xkk --> LD Vx, byte -- place value kk into this.register Vx
            reg1 = opcode & 0x0F00;
            reg1 = reg1 >> 8;
            tempVal = opcode & 0x00FF;
            this.register[reg1] = tempVal;
            console.log("reg1: " + this.register[reg1]);
            break;
        
        case 0x7: //opcode 0x7xkk --> ADD Vx, byte -- add value kk to Vx and place in Vx
            reg1 = opcode & 0x0F00;
            reg1 = reg1 >> 8;
            tempVal = opcode & 0x00FF;
            tempVal = tempVal + this.register[reg1];
            this.register[reg1] = tempVal;
            console.log("reg1: " + this.register[reg1]);
            break;
        
        case 0x8: //opcodes 8xy0 through 8xyE
            reg1 = opcode & 0x0F00;
            reg1 = reg1 >> 8; //Vx
            reg2 = opcode & 0x00F0;
            reg2 = reg2 >> 4; //Vy
            switch (opcode & 0x000F) {
                case 0x0: //opcode 8xy0 --> LD Vx, Vy -- set Vx = Vy
                    this.register[reg1] = this.register[reg2];
                    break;
                case 0x1: //opcode 8xy1 --> OR Vx, Vy -- set Vx = Vx OR Vy (bitwise OR operation)
                    this.register[reg1] = this.register[reg1] | this.register[reg2];
                    break;
                case 0x2: //opcode 8xy2 --> AND Vx, Vy -- set Vx = Vx and Vy
                    this.register[reg1] = this.register[reg1] & this.register[reg2];
                    break;
                case 0x3: //opcode 8xy3 --> XOR Vx, Vy -- set Vx = Vx XOR Vy
                    this.register[reg1] = this.register[reg1] ^ this.register[reg2];
                    break;
                case 0x4: //opcode 8xy4 --> ADD Vx, Vy -- set Vx = Vx + Vy, set VF = carry
                    tempVal = this.register[reg1] + this.register[reg2];
                    if (tempVal > 255) {
                        this.register[0xF] = 1;
                        tempVal = tempVal & 0x0FF;
                    }
                    this.register[reg1] = tempVal;
                    break;
                case 0x5: //opcode 8xy5 --> SUB Vx, Vy -- set Vx = Vx - Vy, set VF = NOT borrow
                    if (this.register[reg1] > this.register[reg2]) {
                        this.register[0xF] = 1;
                    } else {
                        this.register[0xF] = 0;
                    }
                    this.register[reg1] = this.register[reg1] - this.register[reg2];
                    break;
                case 0x6: //opcode 8xy6 --> SHR Vx {, Vy} -- set Vx = Vx SHR 1 => if the least-sig bit of Vx is 1,
                    // set VF to 1, otherwise 0. the Vx is divided by 2
                    tempVal = this.register[reg1] & 0x01; //only keep the least significant bit
                    if (tempVal === 0x1) {
                        this.register[0xF] = 1;
                    } else {
                        this.register[0xF] = 0;
                    }
                    this.register[reg1] = this.register[reg1] / 2; //shift to the right by 1
                    break;
                case 0x7: //opcode 8xy7 --> SUBN Vx, Vy -- set Vx = Vy - Vx, set VF = Not borrow
                    if (this.register[reg2] > this.register[reg1]) {
                        this.register[0xF] = 1;
                    } else {
                        this.register[0xF] = 0;
                    }
                    this.register[reg1] = this.register[reg2] - this.register[reg1];
                    break;
                case 0xE: //opcode 8xyE --> SHL Vx, {, Vy} -- set Vx = Vx SHL 1
                    tempVal = this.register[reg1] & 0x80;
                    tempVal = tempVal >> 15; //tempVal = most sig bit
                    if (tempVal === 0x1) {
                        this.register[0xF] = 1;
                    } else {
                        this.register[0xF] = 0;
                    }
                    this.register[reg1] = this.register[reg1] * 2; //shift to the left by 1
                    break;
            }
            break;
        case 0x9: //opcode 9xy0 --> SNE Vx, Vy -- skip next instruction if Vx != Vy
            reg1 = opcode & 0x0F00;
            reg1 = reg1 >> 8; //Vx
            reg2 = opcode & 0x00F0;
            reg2 = reg2 >> 4; //Vy
            if (this.register[reg1] !== this.register[reg2]) {
                programCounter += 2;
            }
            break;
        case 0xA: //opcode Annn --> LD I, addr -- set this.register I = nnn
            tempVal = opcode & 0x0FFF;
            indexRegister = tempVal;
            break;
        case 0xB: //opcode Bnnn --> JP V0, addr -- jump to location nnn + V0
            tempVal = opcode & 0x0FFF;
            tempVal += this.register[0x0];
            programCounter = tempVal;
            break;
        case 0xC: //opcode Cxkk --> RND Vx, byte -- set Vx = random byte (0 to 255) AND kk
            tempVal = Math.random() * (255);
            tempVal = Math.floor(tempVal);
            reg1 = opcode & 0x0F00;
            reg1 = reg1 >> 8; //Vx
            tempVal = tempVal & (opcode & 0x00FF); //random & kk
            this.register[reg1] = tempVal;
            break;
        case 0xD: //opcode Dxyn --> DRW Vx, Vy, nibble --> Display n-sprite starting at mem loc I at (Vx, Vy), set VF = collision
            reg1 = opcode & 0x0F00;
            reg1 = reg1 >> 8; //x coordinate
            var xCoord = this.register[reg1];
            reg2 = opcode & 0x00F0;
            reg2 = reg2 >> 4; //y coordinate
            var yCoord = this.register[reg2];
            tempVal = opcode & 0x000F; //n
            this.register[0xF] = 0; //set VF to 0 initially

            //read in 1 byte from memory at a time
            for (i = 0; i < tempVal; i++) { //loop through each memory location (every loop is one row (y axis))
                var currIndex = indexRegister + i;
                var currByte = memory[currIndex]; //load in current memory location
                var currYCoord = yCoord + i;
                for (j = 0; j < 8; j++) { //loop through each bit and properly adjust graphics array
                    var currXCoord = xCoord + j;
                    //wrap around if necessary
                    if (currYCoord < 0) {
                        currYCoord = currYCoord + 64; //wraps to bottom
                    }
                    else if (currYCoord > 63) {
                        currYCoord = currYCoord - 64; //wraps to top
                    }
                    if (currXCoord < 0) {
                        currXCoord = currXCoord + 32; //wraps to the right
                    }
                    else if (currXCoord > 31) {
                        currXCoord = currXCoord - 32; //wraps to the left
                    }
                    var currPixel = graphics[currXCoord  * currYCoord]; //index of graphics array
                    graphics[currXCoord * currYCoord] ^= ((currByte >>> (7-j)) & 0x01); //should only keep 1 bit (from left to right)
                    if (currPixel === 1 && graphics[currXCoord * currYCoord] === 0) {
                        this.register[0xF] = 1; //if a pixel is flipped from 1 to 0, set VF to 1 (collision)
                    }
                }
            }
            drawFlag = true;
            break;
        case 0xE:
            reg1 = opcode & 0x0F00;
            reg1 = reg1 >>> 8;
            tempVal = this.register[reg1];
            switch(opcode & 0x00FF) {
                case 0x9E: // opcode Ex9E --> SKP Vx -- skip next instruction if key with value Vx is pressed
                    if (tempVal >= 0 && tempVal <= 16) {
                        if (keyState[tempVal] === 1) { //Vx IS pressed
                            programCounter += 2;
                        }
                    }
                    break;
                case 0xA1: // opcode ExA1 --> SKNP Vx -- skip next instruction if key with value Vx is NOT pressed
                    if (tempVal >= 0 && tempVal <= 16) {
                        if (keyState[tempVal] === 0) { //Vx NOT pressed
                            programCounter += 2;
                        }
                    }
                    break;
            }
            break;
        case 0xF: //opcodes that start with F
            reg1 = opcode & 0x0F00;
            reg1 = reg1 >>> 8;
            switch(opcode & 0x00FF) {
                case 0x07: //opcode 0xFx07 --> LD Vx, DT -- set Vx = delay timer value
                    this.register[reg1] = delayTimer;
                    break;
                case 0x0A: //opcode 0xFx0A --> LD Vx, K -- wait for a key press, store the value of the key in Vx
                    this.register[reg1] = waitForKeyPressed();
                    break;
                case 0x15: //opcode 0xFx15 --> LD DT, Vx -- set delay timer = Vx
                    delayTimer = this.register[reg1];
                    break;
                case 0x18: //opcode 0xFx18 --> LD ST, Vx -- set sound timer = Vx;
                    soundTimer = this.register[reg1];
                    break;
                case 0x1E: //opcode 0xFx1E --> ADD I, Vx -- set I = I + Vx
                    indexRegister += this.register[reg1];
                    break;
                case 0x29: //opcode 0xFx29 --> LD F, Vx -- set I = location of sprite for digit Vx
                    indexRegister = this.register[reg1] * 5;
                    break;
                case 0x33: //opcode 0xFx33 --> LD B, Vx -- store BCD representation of Vx in memory locations I, I+1 & I + 2
                    tempVal = this.register[reg1] / 100;
                    memory[indexRegister] = tempVal; //hundreth digit of Vx
                    tempVal = this.register[reg1] - (memory[indexRegister] * 100);
                    memory[indexRegister + 1] = tempVal / 10; //thenth digit
                    tempVal = tempVal - (memory[indexRegister + 1] * 10);
                    memory[indexRegister + 2] = tempVal;
                    break;
                case 0x55: //opcode 0xFx55 --> LD [I], Vx -- Store registers V0 through Vx in memory starting at I
                    for (let i = 0; i < this.register[reg1]; i++) {
                        memory[indexRegister + i] = this.register[i];
                    }
                    break;
                case 0x65: //opcode 0xFx65 --> LD Vx, [I] -- Read registers V0 through Vx from memory starting at I
                    for (let i = 0; i < this.register[reg1]; i++) {
                        this.register[i] = memory[indexRegister + i];
                    }
                    break;
            }
            break;
    }//increment programCounter by 2 after running oneCycle()

  }
}

var ch = new Chip8();
ch.reset()