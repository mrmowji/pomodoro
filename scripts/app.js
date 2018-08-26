const STATES = {
  STARTED: "started",
  STOPPED: "stopped",
  PAUSED: "paused",
};

Vue.component("progress-circle", {
  template: "#progress-circle",
  props: ["percentage"],
});

new Vue({
  el: "#app",
  data: {
    state: STATES.STOPPED,
    minute: 0,
    second: 20,
    title: "Work",
    numberOfIntervals: 1,
    intervals: [
      { title: "Work", length: 20 }
    ],
    currentIntervalIndex: 0,
    numberOfRounds: 1,
    currentRound: 1,
    secondsPassed: 0
  },
  watch: {
    intervals: {
      handler: function (value, oldValue) {
        this.minute = Math.floor(this.intervals[0].length / 60);
        this.second = this.intervals[0].length % 60;
        this.title = this.intervals[0].title;
      },
      deep: true
    },
    numberOfIntervals: function() {
      if (this.numberOfIntervals < this.intervals.length) {
        this.intervals.pop();
      }
      else if (this.numberOfIntervals > this.intervals.length) {
        this.intervals.push({ title: "Work", length: 20 })
      }
    },
  },
  computed: {
    totalTimeInSeconds: function() {
      var i;
      var intervalsLength = 0;
      for (i = 0; i < this.intervals.length; i++) {
        intervalsLength += parseInt(this.intervals[i].length);
      }
      return (intervalsLength) * this.numberOfRounds;
    },
    leftPaddedMinute: function() {
      if (this.minute < 10) {
        return "0" + this.minute;
      }
      return this.minute;
    },
    leftPaddedSecond: function() {
      if (this.second < 10) {
        return "0" + this.second;
      }
      return this.second;
    },
  },
  methods: {
    start: function() {
      this.state = STATES.STARTED;
      this.tick();
      this.interval = setInterval(this._tick, 1000);
    },
    pause: function() {
      this.state = STATES.PAUSED;
      clearInterval(this.interval);
    },
    stop: function() {
      this.state = STATES.STOPPED;
      clearInterval(this.interval);
      this.currentIntervalIndex = 0;
      this.currentRound = 1;
      this.secondsPassed = 0;
      this.minute = Math.floor(this.intervals[0].length / 60);
      this.second = this.intervals[0].length % 60;
      this.title = this.intervals[0].title;
    },
    tick: function() {
      this.secondsPassed++;
      if (this.second !== 0) {
        this.second--;
        return;
      }
      if (this.minute !== 0) {
        this.minute--;
        this.second = 59;
        return;
      }
      var audio = new Audio('statics/audios/work.mp3');
      audio.play();
      this.currentIntervalIndex++;
      if (this.currentIntervalIndex >= this.intervals.length) {
        this.currentIntervalIndex = 0;
        this.currentRound++;
        if (this.currentRound > this.numberOfRounds) {
          this.stop();
          return;
        }
      }
      this.minute = Math.floor((this.intervals[this.currentIntervalIndex].length - 1) / 60);
      this.second = (this.intervals[this.currentIntervalIndex].length - 1) % 60;
      this.title = this.intervals[this.currentIntervalIndex].title;
    }
  }
})
