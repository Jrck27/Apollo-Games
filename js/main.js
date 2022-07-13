class Game {
	constructor() {
		this.prompts = {
			2: "Easy peasy!",
			4: "Not bad, ey?",
			5: "Make it rain!",
			7: "Careful now!",
			8: "Oh oh ...",
			10: "Whew!",
			12: "Make it rain!",
			15: "Watch the speed!",
			18: "You're still here!",
			20: "That's insane :O",
			30: "Don't stop now!",
			40: "You are the ONE",
			50: "Umm ... level 50",
			60: "You're still here!",
		};
		this.background;
		this.RADIUS = 30;
		this.BORDER = 4;
		this.FONT_SIZE = 36;
		this.FPS = 60;
		this.SCORE_LETTER = 20;
		this.GOLD_LETTER = 50;
		this.TIMER = 20;
		this.round = {
			elapsed: 0,
			word_count: 0,
			pop_count: 0,
			letter_count: 0,
			level: 1,
			score: 0,
			time: 0,
			accuracy: 0,
			speed: 0,
		};

		this.circleColor = "#aeeb34";
		this.words = ["hello"];
		this.bubbles = {};
		this.bubblesObj = {};
		this.isPause = false;
		this.canvas = null;
		this.stage = null;
		this.bounds = null;
		(this.sounds = []), (this.cur = null);
		this.start_time = null;
		this.started = false;
		this.sound = true;
		this.isGoldenLetter = false;
		this.ui = {};
		this.notice_timer = null;
		this.goldenletterCounter = 0;

		this.init = function () {
			return this.initialize();
		};
	}

	// initialization
	initialize() {
		this.initUI();
		// update ui elements
		this.updateUI();
	}

	// play/pause the game
	toggleGame() {
		if (!this.started) return false;

		if (createjs.Ticker.getPaused()) {
			this.clearNotice();
			this.canvas.style.opacity = 1;
			createjs.Ticker.setPaused(false);
			this.isPause = false;
		} else {
			createjs.Ticker.setPaused(true);
			this.isPause = true;
			this.canvas.style.opacity = 0;
			this.permaNotice("Hit Space to unpause");
		}
	}

	// init ui elements
	initUI() {
		this.canvas = document.querySelector("#stage");

		// canvas bounds
		this.bounds = new createjs.Rectangle();
		// set the stage
		this.stage = new createjs.Stage(this.canvas);

		this.ui = {
			controls: document.querySelector("#controls"),
			score: document.querySelector("#score"),
			time: document.querySelector("#time"),
			notice: document.querySelector("#notice"),
			level: document.querySelector("#level"),
			words: document.querySelector("#words"),
			accuracy: document.querySelector("#accuracy"),
			speed: document.querySelector("#speed"),
			start_box: document.querySelector("#start"),
			end_box: document.querySelector("#end"),
			sound: document.querySelector("#sound"),
			tips: document.querySelector("#tips"),
			tip: document.querySelector("#tip"),
		};

		// this.background = new createjs.Bitmap("images/bg.jpg");
		// this.background.scale = 3;
		// this.stage.addChild(this.background);
		// this.stage.update();
		// this.ui.end_box.remove();
		// var x = document.getElementById("end");
		// x.style.display = "none";
		this.showTotal();
		// start
		document.querySelector("#btn-start").addEventListener("click", () => {
			this.ui.start_box.remove();

			this.notice("Prepare to start typing ...");
			window.setTimeout(() => {
				this.started = true;
				this.time();

				// load words
				// this.loadWords();
				this.nextWord();

				createjs.Ticker.setFPS(this.FPS);
				createjs.Ticker.addListener(this.tick.bind(this), true);

				// keyboard event listener
				// function onkeypress invoked at this scope...
				document.onkeydown = this.onKeyPress.bind(this);
			}, 3000);
		});

		document.querySelector("#btn-restart").addEventListener("click", () => {
			$("#time").text(0);
			$("#score").text(0);
			$("#words").text(0);
			this.stage.removeAllChildren();
			this.showTotal();

			this.notice("Prepare to start typing ...");
			window.setTimeout(() => {
				this.time();

				this.bubbles = {};
				this.isPause = false;
				this.start_time = null;
				this.started = false;
				this.isGoldenLetter = false;
				// this.ui = {};
				this.notice_timer = null;
				this.goldenletterCounter = 0;
				this.round.score = 0;

				this.started = true;
				this.isPause = false;
				this.toggleGame();

				// load words
				// this.loadWords();
				this.nextWord();
				// createjs.Ticker.setPaused(false);

				createjs.Ticker.setFPS(this.FPS);
				createjs.Ticker.addListener(this.tick.bind(this), true);

				// keyboard event listener
				// function onkeypress invoked at this scope...
				document.onkeydown = this.onKeyPress.bind(this);
			}, 3000);
		});

		this.canvas.addEventListener("click", () => {
			this.toggleGame();
		});

		// Multiple sound objects that can be played simultaneously.
		for (var n = 0; n < 15; n++) {
			var snd = new Audio();
			snd.src =
				"sounds/pluck." + (snd.canPlayType("audio/mpeg") ? "mp3" : "ogg");
			this.sounds.push(snd);
		}
		this.sounds.p = 1;

		this.positionUI();
		window.onresize = this.positionUI;
	}

	// position ui elements
	positionUI() {
		this.canvas = document.querySelector("#stage");

		// canvas bounds
		this.bounds = new createjs.Rectangle();

		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;

		this.bounds.width = this.canvas.width;
		this.bounds.height = this.canvas.height;

		this.RADIUS = Math.ceil(this.canvas.width * 0.019);
		this.FONT_SIZE = Math.ceil(this.canvas.width * 0.022);
		this.BORDER = this.RADIUS * 0.13;
	}

	// show a permanent notice
	permaNotice(msg) {
		window.clearTimeout(this.notice_timer);
		this.ui.notice.innerText = msg;
		this.ui.notice.style.display = "block";
	}
	// hide notice
	clearNotice(msg) {
		this.ui.notice.style.display = "none";
	}

	// show a delayed
	delayedNotice(msg, delay) {
		window.setTimeout(() => {
			this.notice(msg);
		}, delay * 1000);
	}

	// show a notice
	notice(msg) {
		window.clearTimeout(this.notice_timer);

		this.ui.notice.innerText = msg;
		this.ui.notice.style.display = "block";

		this.notice_timer = window.setTimeout(() => {
			this.ui.notice.style.display = "none";
		}, 3000);
	}

	// play a sound
	playSound(s) {
		if (!this.sound) return;

		this.sounds[this.sounds.p - 1].pause();
		this.sounds[this.sounds.p - 1].load();
		this.sounds[this.sounds.p].play();

		if (this.sounds.p >= this.sounds.length - 1) {
			this.sounds.p = 1;
		} else {
			this.sounds.p++;
		}
	}

	// update ui elements
	updateUI() {
		if (!this.started) return;
		this.ui.score.innerText = this.round.score;
		this.ui.words.innerText = this.round.pop_count;
	}

	// create a word and render it
	renderWord(word) {
		word = word.toUpperCase();

		console.log("renderWord -- ", word);

		var g = new createjs.Graphics();
		// draw the circle
		g.setStrokeStyle(this.BORDER);
		g.beginStroke("#000000");
		g.beginFill(this.circleColor);
		g.drawCircle(0, 0, this.RADIUS);

		var x = 100,
			set = [];
		for (var n = 0; n < word.length; n++) {
			var bubble = new createjs.Container(),
				circle = new createjs.Shape(g),
				letter = new createjs.Text(
					word[n] == " " ? "_" : word[n],
					this.FONT_SIZE + "px Arial",
					"#333333"
				);

			letter.textBaseline = "middle";
			letter.textAlign = "center";

			bubble.addChild(circle);
			bubble.addChild(letter);
			bubble.char = word[n];
			bubble.temp_x = x;
			bubble.y = 10;
			bubble.speed = this.random(
				this.round.level / 5 + 1,
				this.round.level / 5 + 3
			); // initial speed

			set.push(bubble);
			this.stage.addChild(bubble);
			x += this.RADIUS + this.random(this.RADIUS + 10, this.RADIUS * 2 + 20);
		}

		for (var n = 0; n < set.length; n++) {
			var bubble = set[n];
			bubble.x = bubble.temp_x + (this.canvas.width - x) / 2;
		}

		set.pointer = 0; // character pointer
		set.deleted = 0; // deleted chars
		set.bad = 0; // bad keypresses

		this.bubbles[word] = set;
		this.cur = word;
		this.round.word_count++;

		// level goes up
		// this.loadWords();
		this.markStart();
	}

	// render the upcoming word
	renderTip(word) {
		if (!this.tips || this.round.word_count == 1) return;
		this.ui.tip.innerText = word;
	}

	// createjs ticker
	tick() {
		for (var word in this.bubbles) {
			if (!this.bubbles.hasOwnProperty(word)) continue;

			// go through all bubbles in the queue and animate them
			for (var n = 0; n < this.bubbles[word].length; n++) {
				if (!this.bubbles[word][n]) continue;

				var bubble = this.bubbles[word][n];
				if (bubble.y - this.RADIUS > this.bounds.height) {
					// if a bubble's crossed the Y boundary, kill it
					this.bubbles[word].deleted++;
					this.stage.removeChild(this.bubbles[word][n]);
					delete this.bubbles[word][n];
				} else {
					bubble.y += bubble.speed;
				}
			}

			// wipe out a fallen word completely
			if (this.bubbles[word].deleted == this.bubbles[word].length) {
				var popped =
					this.bubbles[this.cur].pointer >= this.bubbles[this.cur].length;
				delete this.bubbles[word];
				this.deleted(popped);
			}
		}

		this.stage.update();
	}

	// load words from the dictionary
	loadWords() {
		var rndnumber = this.random(1, 5);
		this.circleColor = "#aeeb34";
		this.isGoldenLetter = false;
		if (rndnumber == 1) {
			this.words = THESAURUS.easy1;
		} else if (rndnumber == 2) {
			this.words = THESAURUS.easy2;
		} else if (rndnumber == 3) {
			this.words = THESAURUS.easy3;
		} else if (rndnumber == 4) {
			this.circleColor = "#FFD700";
			this.isGoldenLetter = true;
			this.words = THESAURUS.hard;
		}

		if (this.prompts.hasOwnProperty(rndnumber)) {
			this.delayedNotice(this.prompts[rndnumber], 5);
		}

		this.words = this.shuffle(this.words);
		this.words.index = 0;
	}

	// up the next word in the queue
	nextWord() {

		this.loadWords();

		// if(!this.started) return
		this.renderWord(this.words[this.words.index]);
		this.words.index = this.words.index + 1 >= this.words.length ? 0 : this.words.index + 1;
		// this.renderTip(this.words[this.words.index]);
	}

	// starttime of a word's creation
	markStart() {
		this.start_time = this.microtime();
	}

	// note elapsed time
	elapsed() {
		this.round.elapsed += this.microtime() - this.start_time;
	}

	// successful pop of a word
	score(word) {
		if (this.isGoldenLetter) {
			this.goldenletterCounter = this.goldenletterCounter + 1;
		}

		var score = (this.isGoldenLetter) ? this.GOLD_LETTER : this.SCORE_LETTER;
		this.round.letter_count += word.length;
		this.round.pop_count++;

		this.elapsed();

		console.log('WORD :', word, ' SCORE :', score, 'is Golden Letter : ', this.isGoldenLetter)
		this.round.score += score;
	}

	time() {
		var c = this;

		var counter = this.TIMER;
		var interval = setInterval(function () {
			if (c.isPause) return;

			counter--;
			// Display 'counter' wherever you want to display it.
			if (counter <= 0) {
				clearInterval(interval);

				window.setTimeout(() => {
					c.reset();
				}, 1.5);

				// $('#time').html("<h3>Time's up</h3>");
				$("#time").text(0);
				return;
			} else {
				$("#time").text(counter);
			}
		}, 1000);
	}

	reset() {
		console.log("RESET");
		this.started = false;
		createjs.Ticker.setPaused(true);
		this.isPause = true;
		this.canvas.style.opacity = 0;
		this.showTotal();
		this.ui.notice.innerText = "";
	}

	showTotal(e) {
		var end = document.getElementById("end");

		document.getElementById("p1").innerHTML =
			"Your Score is <strong>" + this.round.score + "</strong>.";

		if (end.style.display === "none") {
			end.style.display = "block";
		} else {
			end.style.display = "none";
		}
	}

	// a single character's been popped
	popOne(c) {
		this.playSound("pop");
	}

	// a word's been successfully popped by the user
	popped(word) {
		// window.setTimeout(() => {
			this.score(word);
		// }, 1);

		this.round.accuracy += 1;
		this.updateUI();
	}

	// incorrect keypress
	badKey() {
		this.bubbles[this.cur].bad++;
		this.round.accuracy -=
			this.bubbles[this.cur].bad / this.bubbles[this.cur].length;
	}

	// a word's just been deleted off the screen
	deleted(popped) {
		if (!this.started) return;

		if (!popped) {
			// missed a word
			this.round.accuracy -= 1;
			this.elapsed();
		}

		this.updateUI();
		// this.loadWords();
		this.nextWord();

	}

	// keyboard listener
	onKeyPress(e) {
		// space key
		if (e.keyCode == 32) {
			e.preventDefault();
			this.toggleGame();
			return;
		}

		if (e.keyCode < 65 || e.keyCode > 91 || e.ctrlKey || e.AltKey) {
			return;
		}

		if (!createjs.Ticker.getPaused()) {
			e.preventDefault();
		}

		if (!this.cur || !this.bubbles[this.cur] || createjs.Ticker.getPaused())
			return;

		var c = String.fromCharCode(e.keyCode).toUpperCase(),
			p = this.bubbles[this.cur].pointer;

		if (!this.bubbles[this.cur][p]) {
			return;
		}
		if (this.bubbles[this.cur][p].char == c) {
			// correct keypress
			this.bubbles[this.cur][p].speed = 30;
			this.bubbles[this.cur].pointer++;
			this.popOne(c);
		} else {
			// incorrect keypress
			// this.badKey();
		}

		if (this.bubbles[this.cur].pointer >= this.bubbles[this.cur].length) {
			this.popped(this.cur);
		}
	}

	// get a random number betwen min and max
	random(min, max) {
		return Math.floor(Math.random(new Date().getTime()) * (max - min) + min, 0);
	}

	shuffle(o) {
		for (
			var j, x, i = o.length;
			i;
			j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x
		);
		return o;
	}

	microtime(get_as_float) {
		var unixtime_ms = new Date().getTime();
		var sec = parseInt(unixtime_ms / 1000);
		return unixtime_ms / 1000;
	}
}

document.addEventListener(
	"DOMContentLoaded",
	function () {
		let game = new Game();
		game.init();
	},
	false
);
