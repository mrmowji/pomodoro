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
  props: ["percentage"],
});

new Vue({
  el: "#app",
  data: {
    state: STATES.STOPPED,
    minute: 25,
    second: 0,
    title: "Work",
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
    currentRound: 1,
    secondsPassed: 0,
    totalTimeInSeconds: 31200,
  },
  mounted: function() {
  },
  watch: {
    intervals: {
      handler: function (value, oldValue) {
        let intervalsLength = 0;
        for (let i = 0; i < this.intervals.length; i++) {
          this.intervals[i].lengthInSeconds =
            (this.intervals[i].unit === TIME_UNITS.SECOND) ?
            (this.intervals[i].length) :
            (this.intervals[i].length * 60);
          intervalsLength += parseInt(this.intervals[i].lengthInSeconds);
        }
        this.totalTimeInSeconds = (intervalsLength) * this.numberOfRounds;

        this.minute = Math.floor(this.intervals[0].lengthInSeconds / 60);
        this.second = this.intervals[0].lengthInSeconds % 60;
        this.title = this.intervals[0].title;
      },
      deep: true
    },
    numberOfIntervals: function() {
      if (this.numberOfIntervals < this.intervals.length) {
        this.intervals.pop();
      }
      else if (this.numberOfIntervals > this.intervals.length) {
        this.addNewInterval({ });
      }
    },
  },
  computed: {
    remainingTime: function() {
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
    padLeft: function(number, numberOfDigits) {
      let stringNumber = number.toString();
      if (stringNumber.length < numberOfDigits) {
        for (let i = 0; i < numberOfDigits - stringNumber.length; i++) {
          stringNumber = "0" + stringNumber;
        }
      }
      return stringNumber;
    },
    addNewInterval: function(interval) {
      if (interval.title === undefined) {
        if (this.intervals.length > 0) {
          if (this.intervals[this.intervals.length - 1].title.toLowerCase().trim() === "work") {
            interval.title = "Rest";
          } else {
            interval.title = "Work";
          }
        }
      }
      if (interval.length === undefined) {
        interval.length = 20;
      }
      if (interval.unit === undefined) {
        interval.unit = TIME_UNITS.SECOND;
      }
      this.intervals.push(interval);
    },
    toggleIntervalUnit: function(index) {
      if (this.intervals[index].unit === TIME_UNITS.SECOND) {
        this.intervals[index].unit = TIME_UNITS.MINUTE;
      } else {
        this.intervals[index].unit = TIME_UNITS.SECOND;
      }
    },
    start: function() {
      this.state = STATES.STARTED;
      this.tick();
      this.interval = setInterval(this.tick, 1000);
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
      this.minute = Math.floor(this.intervals[0].lengthInSeconds / 60);
      this.second = this.intervals[0].lengthInSeconds % 60;
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
      this.minute = Math.floor((this.intervals[this.currentIntervalIndex].lengthInSeconds - 1) / 60);
      this.second = (this.intervals[this.currentIntervalIndex].lengthInSeconds - 1) % 60;
      this.title = this.intervals[this.currentIntervalIndex].title;
    }
  }
})
