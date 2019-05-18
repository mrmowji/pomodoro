const STATES = {
  STARTED: "started",
  STOPPED: "stopped",
  PAUSED: "paused",
};

const TIME_UNITS = {
  MINUTE: "min",
  SECOND: "sec",
};

Vue.component("progress-circle", {
  template: "#progress-circle",
  props: ["percentage", "intervalPercentage"],
});

new Vue({
  el: "#app",
  data: {
    state: STATES.STOPPED,
    minute: 0,
    second: 0,
    numberOfIntervals: 8,
    intervals: [
      { title: "Work", length: 25, unit: TIME_UNITS.MINUTE },
      { title: "Rest", length: 5, unit: TIME_UNITS.MINUTE },
      { title: "Work", length: 25, unit: TIME_UNITS.MINUTE },
      { title: "Rest", length: 5, unit: TIME_UNITS.MINUTE },
      { title: "Work", length: 25, unit: TIME_UNITS.MINUTE },
      { title: "Rest", length: 5, unit: TIME_UNITS.MINUTE },
      { title: "Work", length: 25, unit: TIME_UNITS.MINUTE },
      { title: "Rest", length: 15, unit: TIME_UNITS.MINUTE },
    ],
    currentIntervalIndex: 0,
    numberOfRounds: 4,
    currentRound: 0,
    secondsPassed: 0,
    intervalsLengthInSeconds: 0,
  },
  mounted: function () {
    this.reset();
  },
  watch: {
    intervals: {
      handler: function (value, oldValue) {
        this.reset();
      },
      deep: true
    },
    numberOfIntervals: function () {
      if (this.numberOfIntervals === "") {
        return;
      }
      if (this.numberOfIntervals < this.intervals.length) {
        let numberOfIntervalsToPop = this.intervals.length - this.numberOfIntervals;
        for (let i = 0; i < numberOfIntervalsToPop; i++) {
          this.intervals.pop();
        }
      }
      else if (this.numberOfIntervals > this.intervals.length) {
        for (let i = this.intervals.length; i < this.numberOfIntervals; i++) {
          this.addNewInterval({});
        }
      }
    },
  },
  computed: {
    totalTimeInSeconds: function () {
      return this.intervalsLengthInSeconds * this.numberOfRounds;
    },
    currentIntervalPercentage: function() {
      let v = this.intervalsLengthInSeconds * (this.currentRound - 1);
      for (let i = 0; i < this.currentIntervalIndex; i++) {
        v += this.intervals[i].lengthInSeconds;
      }
      let t = this.secondsPassed - v;
      return t / this.intervals[this.currentIntervalIndex].lengthInSeconds;
    },
    remainingTime: function () {
      let remainingTimeInSeconds = this.totalTimeInSeconds - this.secondsPassed;
      let hours = Math.floor(remainingTimeInSeconds / 3600);
      let minutes = Math.floor((remainingTimeInSeconds % 3600) / 60);
      let seconds = (remainingTimeInSeconds % 3600) % 60;
      let result = "";
      if (hours > 0) {
        result += this.padLeft(hours, 2) + ":";
      }
      result += this.padLeft(minutes, 2) + ":";
      result += this.padLeft(seconds, 2);
      return result;
    },
  },
  methods: {
    reset: function () {
      this.intervalsLengthInSeconds = 0;
      for (let i = 0; i < this.intervals.length; i++) {
        this.intervals[i].lengthInSeconds =
          (this.intervals[i].unit === TIME_UNITS.SECOND) ?
            (this.intervals[i].length) :
            (this.intervals[i].length * 60);
        this.intervalsLengthInSeconds += parseInt(this.intervals[i].lengthInSeconds);
      }

      this.state = STATES.STOPPED;
      this.currentRound = 1;
      this.currentIntervalIndex = 0;
      this.secondsPassed = 0;
      this.minute = Math.floor(this.intervals[0].lengthInSeconds / 60);
      this.second = this.intervals[0].lengthInSeconds % 60;
    },
    padLeft: function (number, numberOfDigits) {
      let stringNumber = number.toString();
      if (stringNumber.length < numberOfDigits) {
        for (let i = 0; i < numberOfDigits - stringNumber.length; i++) {
          stringNumber = "0" + stringNumber;
        }
      }
      return stringNumber;
    },
    findLastIntervalIndex: function(title) {
      for (let i = this.intervals.length - 1; i >= 0; i--) {
        if (this.intervals[i].title.toLowerCase().trim() == title.toLowerCase().trim()) {
          return i;
        }
      }
      return -1;
    },
    addNewInterval: function (interval) {
      if (interval.title === undefined) {
        if (this.intervals.length > 0) {
          if (this.intervals[this.intervals.length - 1].title.toLowerCase().trim() === "rest") {
            interval.title = "Work";
          } else {
            interval.title = "Rest";
          }
        }
      }
      let previousSimilarIntervalIndex = this.findLastIntervalIndex(interval.title);
      if (interval.length === undefined) {
        if (previousSimilarIntervalIndex != -1) {
          interval.length = this.intervals[previousSimilarIntervalIndex].length;
        } else {
          interval.length = 5;
        }
      }
      if (interval.unit === undefined) {
        if (previousSimilarIntervalIndex != -1) {
          interval.unit = this.intervals[previousSimilarIntervalIndex].unit;
        } else {
          interval.unit = TIME_UNITS.MINUTE;
        }
      }
      this.intervals.push(interval);
    },
    toggleIntervalUnit: function (index) {
      if (this.intervals[index].unit === TIME_UNITS.SECOND) {
        this.intervals[index].unit = TIME_UNITS.MINUTE;
      } else {
        this.intervals[index].unit = TIME_UNITS.SECOND;
      }
    },
    start: function () {
      if (this.secondsPassed == 0) {
        var audio = new Audio('statics/audios/work.mp3');
        audio.play();
      }
      this.state = STATES.STARTED;
      this.tick();
      this.interval = setInterval(this.tick, 1000);
    },
    pause: function () {
      this.state = STATES.PAUSED;
      clearInterval(this.interval);
    },
    stop: function () {
      clearInterval(this.interval);
      this.reset();
    },
    tick: function () {
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
      this.minute = Math.floor((this.intervals[this.currentIntervalIndex].lengthInSeconds - 1) / 60);
      this.second = (this.intervals[this.currentIntervalIndex].lengthInSeconds - 1) % 60;
    }
  }
})
