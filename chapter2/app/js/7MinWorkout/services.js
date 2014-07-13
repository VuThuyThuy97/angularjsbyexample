'use strict';

/* Services */
angular.module('7minWorkout')
    .factory('workoutHistoryTracker', ['$rootScope', 'appEvents', 'localStorageService', function ($rootScope, appEvents, localStorageService) {
        var maxHistoryItems = 20   //We only track for last 20 exercise
        , storageKey = "workouthistory"
        , workoutHistory = localStorageService.get(storageKey) || []
        , currentWorkoutLog = null
        , service = {};

        function WorkoutLogEntry(args) {
            this.startedOn = args.startedOn;
            this.endedOn = args.endedOn;
            this.lastExercise = args.lastExercise;
            this.exercisesDone = 0;
            this.completed = false;
        };

        service.startTracking = function () {
            currentWorkoutLog = new WorkoutLogEntry({ startedOn: new Date() });
            if (workoutHistory.length >= maxHistoryItems) {     
                workoutHistory.shift();
            }
            workoutHistory.push(currentWorkoutLog);
            localStorageService.add(storageKey, workoutHistory);
        };

        $rootScope.$on(appEvents.workout.exerciseStarted, function (e, args) {
            currentWorkoutLog.lastExercise = args.title;
            ++currentWorkoutLog.exercisesDone;
            localStorageService.add(storageKey, workoutHistory);
        });

        $rootScope.$on("$routeChangeSuccess", function (e, args) {
            if (currentWorkoutLog) {
                service.endTracking(false);     // End the current tracking if in progress the route changes.
            }
        });

        service.endTracking = function (completed) {
            currentWorkoutLog.completed = completed;
            currentWorkoutLog.endedOn = new Date();
            currentWorkoutLog = null;
            localStorageService.add(storageKey, workoutHistory);
        };

        service.getHistory = function () {
            return workoutHistory;
        }

        return service;
    }]);

angular.module('7minWorkout')
    .value("appEvents", {
        workout: { exerciseStarted: "event:workout:exerciseStarted" }
    });