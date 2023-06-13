window.addEventListener('load', () => Sinkship.init());
let playerfield = [];
let computerfield = [];
let inventory = [];
let ship = [];
let isPlaying = false;
const serverURL = 'https://www2.hs-esslingen.de/~melcher/internet-technologien/sinkship/';

const Sinkship = {
    init: function()  {
        const body = document.body;
        const header = document.body.appendChild(this.makeHeader());
        const main = document.body.appendChild(this.makeMain());
        const footer = document.body.appendChild(this.makeFooter());

        this.buildInventory();

        //this.launchShip();
        this.ShipHandler();
    },
    makeHeader() {
        const header = document.createElement('header');
        const headLine = document.createElement('h1');
        const limiter = this.makeLimiter();
        header.appendChild(limiter);

        headLine.textContent = 'SinkShip';
        limiter.append(headLine);

        const p = document.createElement('p');
        p.innerHTML = '&copy; by Baran Ibrahim Cal';
        limiter.append(p);
        return header;
    },
    makeMain() {
        const main = document.createElement('main');
        const limiter = this.makeLimiter();

        const controls = this.makeControls();
        const fields = this.createDiv('fields');
        const playerField = this.makeField('playerfield');
        /*const computerField = this.makeField('computerfield');*/
        const computerField = this.buildMenu();
        limiter.append(controls);
        fields.append(playerField.field);
        fields.append(computerField.field);
        playerfield = playerField.fieldArray;
        //computerfield = computerField.fieldArray;
        limiter.append(fields);
        main.appendChild(limiter);
        return main;
    },
      
    makeFooter() {
        const footer = document.createElement('footer');
        const p = document.createElement('p');
        const limiter = this.makeLimiter();
        footer.appendChild(limiter);
        p.innerHTML = '&copy; by Baran Ibrahim Cal';
        limiter.append(p);
        return footer;
    },
    makeLimiter() {
        const div = document.createElement('div');
        div.classList.add('limiter');
        return div;
    },
    createDiv(className) {
        const div = document.createElement('div');
        div.classList.add(className);
        return div;    
    },
    makeField(idName) {
        const fieldArray = [];
        const field = this.createDiv('field');
        field.id = idName;

        for(let y=0; y<10; y++) {
            const row = [];
            for(let x=0; x<10; x++) {
                const cell = this.createDiv('cell');
                field.append(cell);
                row.push(cell);
            }
            fieldArray.push(row);
        }
        
        return {field, fieldArray};
    },
    makeControls() {
        const control = this.createDiv('controls');

        const build = this.makeButton('Build', 'btnBuild');
        control.append(build);
        build.addEventListener('click', () => this.buildHandler());

        const autoPlace = this.makeButton('Auto Place', 'btnAutoPlace');
        control.append(autoPlace);
        autoPlace.addEventListener('click', () => this.autoPlaceHandler());

        const play = this.makeButton('Play', 'btnPlay');
        control.append(play);
        play.disabled = true;
        play.addEventListener('click', () => this.playHandler());
        isPlaying = false;

        return control;
    },
    makeButton(label, ID) {
        const button = document.createElement('button');
        button.innerText = label;
        button.id = ID;
        return button;
    },
    buildMenu() {
        const field = this.createDiv('field');
        field.id = 'computerfield';

        const table = document.createElement('table');
        field.appendChild(table);

        const tableHead = document.createElement('thead');
        table.appendChild(tableHead);

        const tableRow = document.createElement('tr');
        tableHead.appendChild(tableRow);

        tableRow.appendChild(this.makeTableHeader('Number'));
        tableRow.appendChild(this.makeTableHeader(' '));
        tableRow.appendChild(this.makeTableHeader(' '));
        tableRow.appendChild(this.makeTableHeader('Type'));
        tableRow.appendChild(this.makeTableHeader('Size'));

        const tableBody = document.createElement('tbody');
        table.appendChild(tableBody);

        tableBody.appendChild(this.makeRow(1, 
            ['battleship', 'battleshipH', 'selectable'], 
            ['battleship', 'battleshipV', 'selectable'], 
            'Battleship', 5))
        tableBody.appendChild(this.makeRow(2, 
            ['cruiser', 'cruiserH', 'selectable'], 
            ['cruiser', 'cruiserV', 'selectable'], 
            'Cruiser', 4))
        tableBody.appendChild(this.makeRow(3, 
            ['destroyer', 'destroyerH', 'selectable'], 
            ['destroyer', 'destroyerV', 'selectable'], 
            'Destroyer', 3))
        tableBody.appendChild(this.makeRow(4, 
            ['submarine', 'submarineH', 'selectable'], 
            ['submarine', 'submarineV', 'selectable'], 
            'Submarine', 2))
        return {field};
    },
    makeTableHeader(content) {
        const tableHead = document.createElement('th');
        tableHead.innerHTML = content;
        return tableHead;
    },
    makeTableData(content) {
        const tableData = document.createElement('td');
        tableData.innerHTML = content;
        return tableData;
    },
    makeRow(number, classes1, classes2, type, size) {
        const tableRow = document.createElement('tr');
        tableRow.appendChild(this.makeTableData(number));

        const cl1 = document.createElement('td');
        cl1.classList.add(...classes1);
        cl1.addEventListener('click', () => this.HandleMenuSelection(type, size, 'H'));

        const cl2 = document.createElement('td');
        cl2.classList.add(...classes2);
        cl2.addEventListener('click', () => this.HandleMenuSelection(type, size, 'V'));


        tableRow.appendChild(cl1);
        tableRow.appendChild(cl2);
        tableRow.appendChild(this.makeTableData(type));
        tableRow.appendChild(this.makeTableData(size));
        return tableRow;
    },
    /*launchShip()  {
        playerfield[1][1].classList.add('left');
        playerfield[1][2].classList.add('horizontal');
        playerfield[1][3].classList.add('horizontal');
        playerfield[1][4].classList.add('right');
    },*/
    HandleMenuSelection(type, size, orientation) {
        const clickObject = {type: type, size: size, orientation: orientation};
        const ship = this.getNextFreeShip(size);
        if (ship==null) {
            this.disablePosition();
            return false;
        }
        ship.orientation = orientation;
        this.ship = ship;
        //this.ship.orientation = orientation; //geht auch
        this.UsablePositions(size, orientation);
    },
    UsablePositions(size, orientation) {
        for(let y=0; y<10; y++) {
            for(let x=0; x<10; x++) {
                playerfield[y][x].classList.remove('usable');
                playerfield[y][x].classList.remove('disabled');
                if(this.canPlaceShip(size, orientation, x, y)) {
                    playerfield[y][x].classList.add('usable');
                }
                else {
                    playerfield[y][x].classList.add('disabled');
                }
            }
        }
        /*playerfield[0][0].classList.add('usable');
        playerfield[0][1].classList.add('disabled');*/
    },
    
    /*canPlaceShip(size, orientation, x, y) {
        if (orientation == 'H') {
            if (x >= 11-size) {
                for(let i=x; i<x+size; i++) {
                    if(this.shipsCollideWith(i, y)) {
                        return false;
                    }
                    //else return false;
                }
                return false;
            }
            else return true;
        }
        else {
            if (y >= 11-size) {
                for(let i=y; i<y+size; i++) {
                    if(this.shipsCollideWith(x, i)) {
                        return false;
                    }
                    //else return false;
                }
                return false;
            }
            else return true;
        }
    },*/
    canPlaceShip(size, orientation, x, y) {
        if (orientation === 'H') {
          if (x > 10 - size) {
            return false;
          }
          for (let i = x; i < x + size; i++) {
            if (this.shipsCollideWith(i, y)) {
              return false;
            }
          }
          return true;
        } else {
          if (y > 10 - size) {
            return false;
          }
          for (let i = y; i < y + size; i++) {
            if (this.shipsCollideWith(x, i)) {
              return false;
            }
          }
          return true;
        }
      },      
    ShipHandler() {
        for(let y=0; y<10; y++) {
            for(let x=0; x<10; x++) {
                playerfield[y][x].addEventListener('click', () => this.placeShipHandler(x,y));
            }
        }
    },
    placeShipHandler(x, y) {
        if(isPlaying) {
            return;
        }
        const shipFound = this.findShip(x, y);
            if (shipFound) {
                shipFound.isPlaced = false;
                this.updateScreen(shipFound);
                return;
            }
    
        if (!playerfield[y][x].classList.contains('usable')) {
            return false;
        }
        console.log('X = ' + x + ', Y = ' + y + ', Type: ' + this.ship.type + ', Size: ' + this.ship.size); //Später löschen
        this.ship.x = x;
        this.ship.y = y;
        this.ship.isPlaced = true;
        this.updateScreen(this.ship);
        ship = null;
        //this.drawShip(this.ship);
        console.log(inventory); //Später löschen
    },    
    buildInventory() {
        inventory = [];
        inventory.push({type: 'Battleship', size: 5, isPlaced: false, x: this.x, y: this.y});
        for (let i=0; i<2; i++) {
        inventory.push({type: 'Cruiser', size: 4, isPlaced: false, x: this.x, y: this.y});
        }
        for (let i=0; i<3; i++) {
            inventory.push({type: 'Destroyer', size: 3, isPlaced: false, x: this.x, y: this.y});
        }
        for (let i=0; i<4; i++) {
            inventory.push({type: 'Submarine', size: 2, isPlaced: false, x: this.x, y: this.y});
        }
        console.log(inventory); //Später löschen
    },
    disablePosition() {
        for(let y=0; y<10; y++) {
            for(let x=0; x<10; x++) {
                playerfield[y][x].classList.remove('usable');
                playerfield[y][x].classList.add('disabled');
            }
        }
    },
    getNextFreeShip(size) {
        for (let i=0; i<inventory.length; i++) {
            const ship = inventory[i];
            if(ship.isPlaced==false){
                console.log('IM ERSTEN');
                if(!(size)) {
                    console.log('IN UNDEFINED!');
                    return ship;
                }
                if (ship.size==size) {
                    return ship;
                }
            }
        }
        return null;
    },
    drawShip(ship) {
        console.log('THIS IS DRAWSHIP: ' + ship.size + ', ' + ship.orientation + ', ' + ship.x);
        const x = ship.x;
        const y = ship.y;
        const size = ship.size;
        if(ship.orientation=='H') {
            playerfield[y][x].classList.add('left');
            playerfield[y][x+size-1].classList.add('right');
            for(let i=x+1; i<x+size-1; i++) {
                playerfield[y][i].classList.add('horizontal');
            }
        }
        else {
            playerfield[y][x].classList.add('top');
            playerfield[y+size-1][x].classList.add('bottom');
            for(let i=y+1; i<y+size-1; i++) {
                playerfield[i][x].classList.add('vertical');
            }
        }
        //this.shipsCollideWith(x, y);
    },
    shipsCollideWith(x, y) {
        for(let i=0; i<inventory.length; i++) {
            //console.log(x);
            if(inventory[i].isPlaced==true) {
                console.log('VOR IF');
                if(this.shipCollideWith(inventory[i], x, y)) {
                    console.log('IN SHIPSCOLLIDEWITH' + inventory[i]); //PROBLEM
                    return true;
                }
            }
        }
        return false;
    },
    //FUNKTION WIRD AUFGERUFEN
    shipCollideWith(ship, x, y ) {
        //console.log('SCHIFF ' + ship.x);
        if(ship.orientation=='H') {
            //console.log(ship.x);
            return this.shipCollideWithHorizontal(ship, x, y);
        }
        else {
            //console.log('SCHIFF ' + ship.x);
            return this.shipCollideWithVertical(ship, x, y);
        }
    },
    shipCollideWithHorizontal(ship, x, y) {
        for (let i = ship.x; i < ship.x+ship.size; i++) {
            if(i==x && ship.y-1==y) {
                return true;
            }
        }
        for (let i = ship.x; i < ship.x+ship.size; i++) {
            if(i==x && ship.y+1==y) {
                return true;
            }
        }
        for (let i = ship.x-1; i < ship.x+ship.size+1; i++) {
            if(i==x && ship.y==y) {
                return true;
            }
        }
    },
      
    shipCollideWithVertical(ship, x, y) {
        for (let i = ship.y; i < ship.y+ship.size; i++) {
            if(i==y && ship.x-1==x) {
                return true;
            }
        }
        for (let i = ship.y; i < ship.y+ship.size; i++) {
            if(i==y && ship.x+1==x) {
                return true;
            }
        }
        for (let i = ship.y-1; i < ship.y+ship.size+1; i++) {
            if(i==y && ship.x==x) {
                return true;
            }
        }
    },
    updateScreen(ship) {
        this.clearSea();
        this.remainingShips(ship);
        for(let i=0; i<inventory.length; i++) {
            if(inventory[i].isPlaced) {
                this.drawShip(inventory[i]);
            }
        }
        this.updatePlayButton();
        if(!(this.getNextFreeShip())) {
            this.fillWater();
        }
        else this.emptyWater();
    },
    clearSea() {
        for(let y=0; y<10; y++) {
            for(let x=0; x<10; x++) {
                playerfield[y][x].classList.remove('usable', 'disabled', 'right', 'left', 'top', 'bottom', 'horizontal', 'vertical');
            }
        }
    },
    remainingShips(ship) {
        console.log(inventory);
        this.remainingShipsOfSize(5, 'battleship');
        this.remainingShipsOfSize(4, 'cruiser');
        this.remainingShipsOfSize(3, 'destroyer');
        this.remainingShipsOfSize(2, 'submarine');
    },
    remainingShipsOfSize(size, name) {
        const className = '.' + name;
        const ShipsAvailable = this.freeShipOfSize(size)
        const shipMarkers = document.querySelectorAll(className);
        console.log(shipMarkers);

        if(ShipsAvailable) {
            for(let i=0; i<shipMarkers.length; i++) {
                shipMarkers[i].classList.remove('disabled');
                shipMarkers[i].classList.add('selectable');
            }
        }
        else {
            for(let i=0; i<shipMarkers.length; i++) {
            shipMarkers[i].classList.remove('selectable');
            shipMarkers[i].classList.add('disabled');
            }
        }
    },
    freeShipOfSize(size) {
        for(let i=0; i<inventory.length; i++) {
            if(!(inventory[i].isPlaced) && inventory[i].size==size) {
                return true;
            }
        }
        return false;
    },
    findShip(x, y) {
        for(let i=0; i<inventory.length; i++) {
            if(this.positionHitShip(inventory[i], x, y)) {
                return inventory[i];
            }
        }
        return null;
    },
    positionHitShip(ship, testX, testY) {
        let deltaX = ship.orientation == 'H' ? 1 : 0;
        let deltaY = ship.orientation == 'V' ? 1 : 0;

        let x=ship.x;
        let y=ship.y;
         
        console.log('IN POSITIONHITSHIP');
        console.log('SHIPX: ' + x + ' TESTX: ' + testX);

        for(let pos=0; pos<ship.size; pos++) {
            if(x==testX && y==testY) {
                console.log('IN RETURN TRUE');
                return true;
            }
            deltaX++;
            deltaY++;
        }
        return false;
    },
    buildHandler() {
        const computerField = this.buildMenu();
        const fieldArray = computerField.fieldArray;
        const field = computerField.field;
        computerfield = computerField.fieldArray;
        document.getElementById('computerfield').replaceWith(field);

        isPlaying = false;
        this.clearInventory();
        this.updateScreen(); //inventory einfügen eventuell
    },
    updatePlayButton() {
        for(let i=0; i<inventory.length; i++) {
            if(!(inventory[i].isPlaced)) {
                const playBtn = document.getElementById('btnPlay');
                playBtn.disabled = true;
            }
            else {
                const playBtn = document.getElementById('btnPlay');
                playBtn.disabled = false;
            }
        }
    },
    playHandler() {
        const computerField = this.makeField('computerfield');
        const fieldArray = computerField.fieldArray;
        const field = computerField.field;
        computerfield = computerField.fieldArray;
        document.getElementById('computerfield').replaceWith(field);

        isPlaying = true;
        this.disableBattlefield();

        this.sendStart();
    },
    autoPlaceHandler() {
        const computerField = this.buildMenu();
        const fieldArray = computerField.fieldArray;
        const field = computerField.field;
        computerfield = computerField.fieldArray;
        document.getElementById('computerfield').replaceWith(field);

        isPlaying = false;
        this.clearInventory();
        this.placeNextShips();
        this.updateScreen(); //inventory einfügen eventuel
    },
    clearInventory() {
        for(let i=0; i<inventory.length; i++) {
            inventory[i].isPlaced = false;
        }
    },
    placeNextShips() {
        const ship = this.getNextFreeShip();
        console.log(ship);
        if(!ship) return true;

        while(true) {
            const x = Math.floor(Math.random() * 10);
            const y = Math.floor(Math.random() * 10);
            const orientation = Math.floor(Math.random() * 2) == 0 ? 'H' : 'V';

            console.log('FÜR X: ' + x + ', FÜR Y: ' + y + ', FÜR ORIENTATION: ' + orientation);

            if(this.canPlaceShip(ship.size, orientation, x, y)) {
                console.log('MÜSSTE PLATZIEREN');
                ship.x=x;
                ship.y=y;
                ship.orientation=orientation;
                ship.isPlaced = true;
            }
            if(this.placeNextShips()) {
                return true;
            }
            ship.isPlaced=false;
        }
    },
    fillWater() {
        for(let y=0; y<10; y++) {
            for(let x=0; x<10; x++) {
                if(this.isOpenSea(playerfield[y][x])) {
                    playerfield[y][x].classList.add('water');
                }
            }
        }
    },
    emptyWater() {
        for(let y=0; y<10; y++) {
            for(let x=0; x<10; x++) {
                if(this.isOpenSea(playerfield[y][x])) {
                    playerfield[y][x].classList.remove('water');
                }
            }
        }
    },
    isOpenSea(field) {
        const shipClasses = ['left', 'right', 'top', 'bottom', 'horizontal', 'vertical'];
        for(let i=0; i<shipClasses.length; i++) {
            if(field.classList.contains(shipClasses[i])) {
                return false;
            }
        }
        return true;
    },
    disableBattlefield() {
        console.log();
        for(let y=0; y<10; y++) {
            for(let x=0; x<10; x++) {
                computerfield[y][x].classList.add('disabled');
            }
        }
    },
    fetchAndDecode(query, stid) {
        fetch(serverURL, `{query}?`)
        .then(response => response.json());
    },
    async sendStart() {
        const request = {request: 'start'};
        console.log(request.request);
        const response = await this.fetchAndDecode(request, 'bacait02');
        console.log(response);
    },
};