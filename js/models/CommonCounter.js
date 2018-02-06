function CommonCounter() {
    this.counter = 0;
}


CommonCounter.prototype.set = function(n) {
    this.counter=n;
}

CommonCounter.prototype.increment = function(n) {
    if (n!=undefined) {
        this.counter+=n;
    }else {
        this.counter++;
    }
}

CommonCounter.prototype.decrement = function(n) {
    if (n!=undefined) {
        this.counter-=n;
    }else {
        this.counter--;
    }
}


CommonCounter.prototype.reset = function() {
    this.counter=0;
}


CommonCounter.prototype.toString = function() {
    return this.counter;
}