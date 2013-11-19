angular.module('iUtltimateApp', ['ui.bootstrap']).config([
  '$routeProvider',
  function ($routeProvider) {
    $routeProvider.when('/404', { templateUrl: 'views/404.html' }).when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainpageCtrl',
      reloadOnSearch: false
    }).when('/:teamId', {
      templateUrl: 'views/main.html',
      controller: 'MainpageCtrl',
      reloadOnSearch: false
    }).when('/:teamId/:playerName', {
      templateUrl: 'views/main.html',
      controller: 'MainpageCtrl',
      reloadOnSearch: false
    }).otherwise({ redirectTo: '/' });
  }
]);
angular.module('ui.bootstrap', [
  'ui.bootstrap.transition',
  'ui.bootstrap.collapse',
  'ui.bootstrap.accordion',
  'ui.bootstrap.alert',
  'ui.bootstrap.bindHtml',
  'ui.bootstrap.buttons',
  'ui.bootstrap.carousel',
  'ui.bootstrap.position',
  'ui.bootstrap.datepicker',
  'ui.bootstrap.dropdownToggle',
  'ui.bootstrap.modal',
  'ui.bootstrap.pagination',
  'ui.bootstrap.tooltip',
  'ui.bootstrap.popover',
  'ui.bootstrap.progressbar',
  'ui.bootstrap.rating',
  'ui.bootstrap.tabs',
  'ui.bootstrap.timepicker',
  'ui.bootstrap.typeahead'
]);
angular.module('ui.bootstrap.transition', []).factory('$transition', [
  '$q',
  '$timeout',
  '$rootScope',
  function ($q, $timeout, $rootScope) {
    var $transition = function (element, trigger, options) {
      options = options || {};
      var deferred = $q.defer();
      var endEventName = $transition[options.animation ? 'animationEndEventName' : 'transitionEndEventName'];
      var transitionEndHandler = function (event) {
        $rootScope.$apply(function () {
          element.unbind(endEventName, transitionEndHandler);
          deferred.resolve(element);
        });
      };
      if (endEventName) {
        element.bind(endEventName, transitionEndHandler);
      }
      $timeout(function () {
        if (angular.isString(trigger)) {
          element.addClass(trigger);
        } else if (angular.isFunction(trigger)) {
          trigger(element);
        } else if (angular.isObject(trigger)) {
          element.css(trigger);
        }
        if (!endEventName) {
          deferred.resolve(element);
        }
      });
      deferred.promise.cancel = function () {
        if (endEventName) {
          element.unbind(endEventName, transitionEndHandler);
        }
        deferred.reject('Transition cancelled');
      };
      return deferred.promise;
    };
    var transElement = document.createElement('trans');
    var transitionEndEventNames = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'transition': 'transitionend'
      };
    var animationEndEventNames = {
        'WebkitTransition': 'webkitAnimationEnd',
        'MozTransition': 'animationend',
        'OTransition': 'oAnimationEnd',
        'transition': 'animationend'
      };
    function findEndEventName(endEventNames) {
      for (var name in endEventNames) {
        if (transElement.style[name] !== undefined) {
          return endEventNames[name];
        }
      }
    }
    $transition.transitionEndEventName = findEndEventName(transitionEndEventNames);
    $transition.animationEndEventName = findEndEventName(animationEndEventNames);
    return $transition;
  }
]);
angular.module('ui.bootstrap.collapse', ['ui.bootstrap.transition']).directive('collapse', [
  '$transition',
  function ($transition) {
    var fixUpHeight = function (scope, element, height) {
      element.removeClass('collapse');
      element.css({ height: height });
      var x = element[0].offsetWidth;
      element.addClass('collapse');
    };
    return {
      link: function (scope, element, attrs) {
        var isCollapsed;
        var initialAnimSkip = true;
        scope.$watch(function () {
          return element[0].scrollHeight;
        }, function (value) {
          if (element[0].scrollHeight !== 0) {
            if (!isCollapsed) {
              if (initialAnimSkip) {
                fixUpHeight(scope, element, element[0].scrollHeight + 'px');
              } else {
                fixUpHeight(scope, element, 'auto');
              }
            }
          }
        });
        scope.$watch(attrs.collapse, function (value) {
          if (value) {
            collapse();
          } else {
            expand();
          }
        });
        var currentTransition;
        var doTransition = function (change) {
          if (currentTransition) {
            currentTransition.cancel();
          }
          currentTransition = $transition(element, change);
          currentTransition.then(function () {
            currentTransition = undefined;
          }, function () {
            currentTransition = undefined;
          });
          return currentTransition;
        };
        var expand = function () {
          if (initialAnimSkip) {
            initialAnimSkip = false;
            if (!isCollapsed) {
              fixUpHeight(scope, element, 'auto');
            }
          } else {
            doTransition({ height: element[0].scrollHeight + 'px' }).then(function () {
              if (!isCollapsed) {
                fixUpHeight(scope, element, 'auto');
              }
            });
          }
          isCollapsed = false;
        };
        var collapse = function () {
          isCollapsed = true;
          if (initialAnimSkip) {
            initialAnimSkip = false;
            fixUpHeight(scope, element, 0);
          } else {
            fixUpHeight(scope, element, element[0].scrollHeight + 'px');
            doTransition({ 'height': '0' });
          }
        };
      }
    };
  }
]);
angular.module('ui.bootstrap.accordion', ['ui.bootstrap.collapse']).constant('accordionConfig', { closeOthers: true }).controller('AccordionController', [
  '$scope',
  '$attrs',
  'accordionConfig',
  function ($scope, $attrs, accordionConfig) {
    this.groups = [];
    this.closeOthers = function (openGroup) {
      var closeOthers = angular.isDefined($attrs.closeOthers) ? $scope.$eval($attrs.closeOthers) : accordionConfig.closeOthers;
      if (closeOthers) {
        angular.forEach(this.groups, function (group) {
          if (group !== openGroup) {
            group.isOpen = false;
          }
        });
      }
    };
    this.addGroup = function (groupScope) {
      var that = this;
      this.groups.push(groupScope);
      groupScope.$on('$destroy', function (event) {
        that.removeGroup(groupScope);
      });
    };
    this.removeGroup = function (group) {
      var index = this.groups.indexOf(group);
      if (index !== -1) {
        this.groups.splice(this.groups.indexOf(group), 1);
      }
    };
  }
]).directive('accordion', function () {
  return {
    restrict: 'EA',
    controller: 'AccordionController',
    transclude: true,
    replace: false,
    templateUrl: 'views/accordion/accordion.html'
  };
}).directive('accordionGroup', [
  '$parse',
  '$transition',
  '$timeout',
  function ($parse, $transition, $timeout) {
    return {
      require: '^accordion',
      restrict: 'EA',
      transclude: true,
      replace: true,
      templateUrl: 'views/accordion/accordion-group.html',
      scope: { heading: '@' },
      controller: [
        '$scope',
        function ($scope) {
          this.setHeading = function (element) {
            this.heading = element;
          };
        }
      ],
      link: function (scope, element, attrs, accordionCtrl) {
        var getIsOpen, setIsOpen;
        accordionCtrl.addGroup(scope);
        scope.isOpen = false;
        if (attrs.isOpen) {
          getIsOpen = $parse(attrs.isOpen);
          setIsOpen = getIsOpen.assign;
          scope.$watch(function watchIsOpen() {
            return getIsOpen(scope.$parent);
          }, function updateOpen(value) {
            scope.isOpen = value;
          });
          scope.isOpen = getIsOpen ? getIsOpen(scope.$parent) : false;
        }
        scope.$watch('isOpen', function (value) {
          if (value) {
            accordionCtrl.closeOthers(scope);
          }
          if (setIsOpen) {
            setIsOpen(scope.$parent, value);
          }
        });
      }
    };
  }
]).directive('accordionHeading', function () {
  return {
    restrict: 'EA',
    transclude: true,
    template: '',
    replace: true,
    require: '^accordionGroup',
    compile: function (element, attr, transclude) {
      return function link(scope, element, attr, accordionGroupCtrl) {
        accordionGroupCtrl.setHeading(transclude(scope, function () {
        }));
      };
    }
  };
}).directive('accordionTransclude', function () {
  return {
    require: '^accordionGroup',
    link: function (scope, element, attr, controller) {
      scope.$watch(function () {
        return controller[attr.accordionTransclude];
      }, function (heading) {
        if (heading) {
          element.html('');
          element.append(heading);
        }
      });
    }
  };
});
angular.module('ui.bootstrap.alert', []).directive('alert', function () {
  return {
    restrict: 'EA',
    templateUrl: 'template/alert/alert.html',
    transclude: true,
    replace: true,
    scope: {
      type: '=',
      close: '&'
    },
    link: function (scope, iElement, iAttrs, controller) {
      scope.closeable = 'close' in iAttrs;
    }
  };
});
angular.module('ui.bootstrap.bindHtml', []).directive('bindHtmlUnsafe', function () {
  return function (scope, element, attr) {
    element.addClass('ng-binding').data('$binding', attr.bindHtmlUnsafe);
    scope.$watch(attr.bindHtmlUnsafe, function bindHtmlUnsafeWatchAction(value) {
      element.html(value || '');
    });
  };
});
angular.module('ui.bootstrap.buttons', []).constant('buttonConfig', {
  activeClass: 'active',
  toggleEvent: 'click'
}).directive('btnRadio', [
  'buttonConfig',
  function (buttonConfig) {
    var activeClass = buttonConfig.activeClass || 'active';
    var toggleEvent = buttonConfig.toggleEvent || 'click';
    return {
      require: 'ngModel',
      link: function (scope, element, attrs, ngModelCtrl) {
        ngModelCtrl.$render = function () {
          element.toggleClass(activeClass, angular.equals(ngModelCtrl.$modelValue, scope.$eval(attrs.btnRadio)));
        };
        element.bind(toggleEvent, function () {
          if (!element.hasClass(activeClass)) {
            scope.$apply(function () {
              ngModelCtrl.$setViewValue(scope.$eval(attrs.btnRadio));
              ngModelCtrl.$render();
            });
          }
        });
      }
    };
  }
]).directive('btnCheckbox', [
  'buttonConfig',
  function (buttonConfig) {
    var activeClass = buttonConfig.activeClass || 'active';
    var toggleEvent = buttonConfig.toggleEvent || 'click';
    return {
      require: 'ngModel',
      link: function (scope, element, attrs, ngModelCtrl) {
        function getTrueValue() {
          var trueValue = scope.$eval(attrs.btnCheckboxTrue);
          return angular.isDefined(trueValue) ? trueValue : true;
        }
        function getFalseValue() {
          var falseValue = scope.$eval(attrs.btnCheckboxFalse);
          return angular.isDefined(falseValue) ? falseValue : false;
        }
        ngModelCtrl.$render = function () {
          element.toggleClass(activeClass, angular.equals(ngModelCtrl.$modelValue, getTrueValue()));
        };
        element.bind(toggleEvent, function () {
          scope.$apply(function () {
            ngModelCtrl.$setViewValue(element.hasClass(activeClass) ? getFalseValue() : getTrueValue());
            ngModelCtrl.$render();
          });
        });
      }
    };
  }
]);
angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition']).controller('CarouselController', [
  '$scope',
  '$timeout',
  '$transition',
  '$q',
  function ($scope, $timeout, $transition, $q) {
    var self = this, slides = self.slides = [], currentIndex = -1, currentTimeout, isPlaying;
    self.currentSlide = null;
    self.select = function (nextSlide, direction) {
      var nextIndex = slides.indexOf(nextSlide);
      if (direction === undefined) {
        direction = nextIndex > currentIndex ? 'next' : 'prev';
      }
      if (nextSlide && nextSlide !== self.currentSlide) {
        if ($scope.$currentTransition) {
          $scope.$currentTransition.cancel();
          $timeout(goNext);
        } else {
          goNext();
        }
      }
      function goNext() {
        if (self.currentSlide && angular.isString(direction) && !$scope.noTransition && nextSlide.$element) {
          nextSlide.$element.addClass(direction);
          var reflow = nextSlide.$element[0].offsetWidth;
          angular.forEach(slides, function (slide) {
            angular.extend(slide, {
              direction: '',
              entering: false,
              leaving: false,
              active: false
            });
          });
          angular.extend(nextSlide, {
            direction: direction,
            active: true,
            entering: true
          });
          angular.extend(self.currentSlide || {}, {
            direction: direction,
            leaving: true
          });
          $scope.$currentTransition = $transition(nextSlide.$element, {});
          (function (next, current) {
            $scope.$currentTransition.then(function () {
              transitionDone(next, current);
            }, function () {
              transitionDone(next, current);
            });
          }(nextSlide, self.currentSlide));
        } else {
          transitionDone(nextSlide, self.currentSlide);
        }
        self.currentSlide = nextSlide;
        currentIndex = nextIndex;
        restartTimer();
      }
      function transitionDone(next, current) {
        angular.extend(next, {
          direction: '',
          active: true,
          leaving: false,
          entering: false
        });
        angular.extend(current || {}, {
          direction: '',
          active: false,
          leaving: false,
          entering: false
        });
        $scope.$currentTransition = null;
      }
    };
    self.indexOfSlide = function (slide) {
      return slides.indexOf(slide);
    };
    $scope.next = function () {
      var newIndex = (currentIndex + 1) % slides.length;
      if (!$scope.$currentTransition) {
        return self.select(slides[newIndex], 'next');
      }
    };
    $scope.prev = function () {
      var newIndex = currentIndex - 1 < 0 ? slides.length - 1 : currentIndex - 1;
      if (!$scope.$currentTransition) {
        return self.select(slides[newIndex], 'prev');
      }
    };
    $scope.select = function (slide) {
      self.select(slide);
    };
    $scope.isActive = function (slide) {
      return self.currentSlide === slide;
    };
    $scope.slides = function () {
      return slides;
    };
    $scope.$watch('interval', restartTimer);
    function restartTimer() {
      if (currentTimeout) {
        $timeout.cancel(currentTimeout);
      }
      function go() {
        if (isPlaying) {
          $scope.next();
          restartTimer();
        } else {
          $scope.pause();
        }
      }
      var interval = +$scope.interval;
      if (!isNaN(interval) && interval >= 0) {
        currentTimeout = $timeout(go, interval);
      }
    }
    $scope.play = function () {
      if (!isPlaying) {
        isPlaying = true;
        restartTimer();
      }
    };
    $scope.pause = function () {
      if (!$scope.noPause) {
        isPlaying = false;
        if (currentTimeout) {
          $timeout.cancel(currentTimeout);
        }
      }
    };
    self.addSlide = function (slide, element) {
      slide.$element = element;
      slides.push(slide);
      if (slides.length === 1 || slide.active) {
        self.select(slides[slides.length - 1]);
        if (slides.length == 1) {
          $scope.play();
        }
      } else {
        slide.active = false;
      }
    };
    self.removeSlide = function (slide) {
      var index = slides.indexOf(slide);
      slides.splice(index, 1);
      if (slides.length > 0 && slide.active) {
        if (index >= slides.length) {
          self.select(slides[index - 1]);
        } else {
          self.select(slides[index]);
        }
      } else if (currentIndex > index) {
        currentIndex--;
      }
    };
  }
]).directive('carousel', [function () {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      controller: 'CarouselController',
      require: 'carousel',
      templateUrl: 'template/carousel/carousel.html',
      scope: {
        interval: '=',
        noTransition: '=',
        noPause: '='
      }
    };
  }]).directive('slide', [
  '$parse',
  function ($parse) {
    return {
      require: '^carousel',
      restrict: 'EA',
      transclude: true,
      replace: true,
      templateUrl: 'template/carousel/slide.html',
      scope: {},
      link: function (scope, element, attrs, carouselCtrl) {
        if (attrs.active) {
          var getActive = $parse(attrs.active);
          var setActive = getActive.assign;
          var lastValue = scope.active = getActive(scope.$parent);
          scope.$watch(function parentActiveWatch() {
            var parentActive = getActive(scope.$parent);
            if (parentActive !== scope.active) {
              if (parentActive !== lastValue) {
                lastValue = scope.active = parentActive;
              } else {
                setActive(scope.$parent, parentActive = lastValue = scope.active);
              }
            }
            return parentActive;
          });
        }
        carouselCtrl.addSlide(scope, element);
        scope.$on('$destroy', function () {
          carouselCtrl.removeSlide(scope);
        });
        scope.$watch('active', function (active) {
          if (active) {
            carouselCtrl.select(scope);
          }
        });
      }
    };
  }
]);
angular.module('ui.bootstrap.position', []).factory('$position', [
  '$document',
  '$window',
  function ($document, $window) {
    function getStyle(el, cssprop) {
      if (el.currentStyle) {
        return el.currentStyle[cssprop];
      } else if ($window.getComputedStyle) {
        return $window.getComputedStyle(el)[cssprop];
      }
      return el.style[cssprop];
    }
    function isStaticPositioned(element) {
      return (getStyle(element, 'position') || 'static') === 'static';
    }
    var parentOffsetEl = function (element) {
      var docDomEl = $document[0];
      var offsetParent = element.offsetParent || docDomEl;
      while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent)) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docDomEl;
    };
    return {
      position: function (element) {
        var elBCR = this.offset(element);
        var offsetParentBCR = {
            top: 0,
            left: 0
          };
        var offsetParentEl = parentOffsetEl(element[0]);
        if (offsetParentEl != $document[0]) {
          offsetParentBCR = this.offset(angular.element(offsetParentEl));
          offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
          offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }
        return {
          width: element.prop('offsetWidth'),
          height: element.prop('offsetHeight'),
          top: elBCR.top - offsetParentBCR.top,
          left: elBCR.left - offsetParentBCR.left
        };
      },
      offset: function (element) {
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: element.prop('offsetWidth'),
          height: element.prop('offsetHeight'),
          top: boundingClientRect.top + ($window.pageYOffset || $document[0].body.scrollTop || $document[0].documentElement.scrollTop),
          left: boundingClientRect.left + ($window.pageXOffset || $document[0].body.scrollLeft || $document[0].documentElement.scrollLeft)
        };
      }
    };
  }
]);
angular.module('ui.bootstrap.datepicker', ['ui.bootstrap.position']).constant('datepickerConfig', {
  dayFormat: 'dd',
  monthFormat: 'MMMM',
  yearFormat: 'yyyy',
  dayHeaderFormat: 'EEE',
  dayTitleFormat: 'MMMM yyyy',
  monthTitleFormat: 'yyyy',
  showWeeks: true,
  startingDay: 0,
  yearRange: 20,
  minDate: null,
  maxDate: null
}).controller('DatepickerController', [
  '$scope',
  '$attrs',
  'dateFilter',
  'datepickerConfig',
  function ($scope, $attrs, dateFilter, dtConfig) {
    var format = {
        day: getValue($attrs.dayFormat, dtConfig.dayFormat),
        month: getValue($attrs.monthFormat, dtConfig.monthFormat),
        year: getValue($attrs.yearFormat, dtConfig.yearFormat),
        dayHeader: getValue($attrs.dayHeaderFormat, dtConfig.dayHeaderFormat),
        dayTitle: getValue($attrs.dayTitleFormat, dtConfig.dayTitleFormat),
        monthTitle: getValue($attrs.monthTitleFormat, dtConfig.monthTitleFormat)
      }, startingDay = getValue($attrs.startingDay, dtConfig.startingDay), yearRange = getValue($attrs.yearRange, dtConfig.yearRange);
    this.minDate = dtConfig.minDate ? new Date(dtConfig.minDate) : null;
    this.maxDate = dtConfig.maxDate ? new Date(dtConfig.maxDate) : null;
    function getValue(value, defaultValue) {
      return angular.isDefined(value) ? $scope.$parent.$eval(value) : defaultValue;
    }
    function getDaysInMonth(year, month) {
      return new Date(year, month, 0).getDate();
    }
    function getDates(startDate, n) {
      var dates = new Array(n);
      var current = startDate, i = 0;
      while (i < n) {
        dates[i++] = new Date(current);
        current.setDate(current.getDate() + 1);
      }
      return dates;
    }
    function makeDate(date, format, isSelected, isSecondary) {
      return {
        date: date,
        label: dateFilter(date, format),
        selected: !!isSelected,
        secondary: !!isSecondary
      };
    }
    this.modes = [
      {
        name: 'day',
        getVisibleDates: function (date, selected) {
          var year = date.getFullYear(), month = date.getMonth(), firstDayOfMonth = new Date(year, month, 1);
          var difference = startingDay - firstDayOfMonth.getDay(), numDisplayedFromPreviousMonth = difference > 0 ? 7 - difference : -difference, firstDate = new Date(firstDayOfMonth), numDates = 0;
          if (numDisplayedFromPreviousMonth > 0) {
            firstDate.setDate(-numDisplayedFromPreviousMonth + 1);
            numDates += numDisplayedFromPreviousMonth;
          }
          numDates += getDaysInMonth(year, month + 1);
          numDates += (7 - numDates % 7) % 7;
          var days = getDates(firstDate, numDates), labels = new Array(7);
          for (var i = 0; i < numDates; i++) {
            var dt = new Date(days[i]);
            days[i] = makeDate(dt, format.day, selected && selected.getDate() === dt.getDate() && selected.getMonth() === dt.getMonth() && selected.getFullYear() === dt.getFullYear(), dt.getMonth() !== month);
          }
          for (var j = 0; j < 7; j++) {
            labels[j] = dateFilter(days[j].date, format.dayHeader);
          }
          return {
            objects: days,
            title: dateFilter(date, format.dayTitle),
            labels: labels
          };
        },
        compare: function (date1, date2) {
          return new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()) - new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
        },
        split: 7,
        step: { months: 1 }
      },
      {
        name: 'month',
        getVisibleDates: function (date, selected) {
          var months = new Array(12), year = date.getFullYear();
          for (var i = 0; i < 12; i++) {
            var dt = new Date(year, i, 1);
            months[i] = makeDate(dt, format.month, selected && selected.getMonth() === i && selected.getFullYear() === year);
          }
          return {
            objects: months,
            title: dateFilter(date, format.monthTitle)
          };
        },
        compare: function (date1, date2) {
          return new Date(date1.getFullYear(), date1.getMonth()) - new Date(date2.getFullYear(), date2.getMonth());
        },
        split: 3,
        step: { years: 1 }
      },
      {
        name: 'year',
        getVisibleDates: function (date, selected) {
          var years = new Array(yearRange), year = date.getFullYear(), startYear = parseInt((year - 1) / yearRange, 10) * yearRange + 1;
          for (var i = 0; i < yearRange; i++) {
            var dt = new Date(startYear + i, 0, 1);
            years[i] = makeDate(dt, format.year, selected && selected.getFullYear() === dt.getFullYear());
          }
          return {
            objects: years,
            title: [
              years[0].label,
              years[yearRange - 1].label
            ].join(' - ')
          };
        },
        compare: function (date1, date2) {
          return date1.getFullYear() - date2.getFullYear();
        },
        split: 5,
        step: { years: yearRange }
      }
    ];
    this.isDisabled = function (date, mode) {
      var currentMode = this.modes[mode || 0];
      return this.minDate && currentMode.compare(date, this.minDate) < 0 || this.maxDate && currentMode.compare(date, this.maxDate) > 0 || $scope.dateDisabled && $scope.dateDisabled({
        date: date,
        mode: currentMode.name
      });
    };
  }
]).directive('datepicker', [
  'dateFilter',
  '$parse',
  'datepickerConfig',
  '$log',
  function (dateFilter, $parse, datepickerConfig, $log) {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'template/datepicker/datepicker.html',
      scope: { dateDisabled: '&' },
      require: [
        'datepicker',
        '?^ngModel'
      ],
      controller: 'DatepickerController',
      link: function (scope, element, attrs, ctrls) {
        var datepickerCtrl = ctrls[0], ngModel = ctrls[1];
        if (!ngModel) {
          return;
        }
        var mode = 0, selected = new Date(), showWeeks = datepickerConfig.showWeeks;
        if (attrs.showWeeks) {
          scope.$parent.$watch($parse(attrs.showWeeks), function (value) {
            showWeeks = !!value;
            updateShowWeekNumbers();
          });
        } else {
          updateShowWeekNumbers();
        }
        if (attrs.min) {
          scope.$parent.$watch($parse(attrs.min), function (value) {
            datepickerCtrl.minDate = value ? new Date(value) : null;
            refill();
          });
        }
        if (attrs.max) {
          scope.$parent.$watch($parse(attrs.max), function (value) {
            datepickerCtrl.maxDate = value ? new Date(value) : null;
            refill();
          });
        }
        function updateShowWeekNumbers() {
          scope.showWeekNumbers = mode === 0 && showWeeks;
        }
        function split(arr, size) {
          var arrays = [];
          while (arr.length > 0) {
            arrays.push(arr.splice(0, size));
          }
          return arrays;
        }
        function refill(updateSelected) {
          var date = null, valid = true;
          if (ngModel.$modelValue) {
            date = new Date(ngModel.$modelValue);
            if (isNaN(date)) {
              valid = false;
              $log.error('Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
            } else if (updateSelected) {
              selected = date;
            }
          }
          ngModel.$setValidity('date', valid);
          var currentMode = datepickerCtrl.modes[mode], data = currentMode.getVisibleDates(selected, date);
          angular.forEach(data.objects, function (obj) {
            obj.disabled = datepickerCtrl.isDisabled(obj.date, mode);
          });
          ngModel.$setValidity('date-disabled', !date || !datepickerCtrl.isDisabled(date));
          scope.rows = split(data.objects, currentMode.split);
          scope.labels = data.labels || [];
          scope.title = data.title;
        }
        function setMode(value) {
          mode = value;
          updateShowWeekNumbers();
          refill();
        }
        ngModel.$render = function () {
          refill(true);
        };
        scope.select = function (date) {
          if (mode === 0) {
            var dt = new Date(ngModel.$modelValue);
            dt.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
            ngModel.$setViewValue(dt);
            refill(true);
          } else {
            selected = date;
            setMode(mode - 1);
          }
        };
        scope.move = function (direction) {
          var step = datepickerCtrl.modes[mode].step;
          selected.setMonth(selected.getMonth() + direction * (step.months || 0));
          selected.setFullYear(selected.getFullYear() + direction * (step.years || 0));
          refill();
        };
        scope.toggleMode = function () {
          setMode((mode + 1) % datepickerCtrl.modes.length);
        };
        scope.getWeekNumber = function (row) {
          return mode === 0 && scope.showWeekNumbers && row.length === 7 ? getISO8601WeekNumber(row[0].date) : null;
        };
        function getISO8601WeekNumber(date) {
          var checkDate = new Date(date);
          checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7));
          var time = checkDate.getTime();
          checkDate.setMonth(0);
          checkDate.setDate(1);
          return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
        }
      }
    };
  }
]).constant('datepickerPopupConfig', {
  dateFormat: 'yyyy-MM-dd',
  closeOnDateSelection: true
}).directive('datepickerPopup', [
  '$compile',
  '$parse',
  '$document',
  '$position',
  'dateFilter',
  'datepickerPopupConfig',
  function ($compile, $parse, $document, $position, dateFilter, datepickerPopupConfig) {
    return {
      restrict: 'EA',
      require: 'ngModel',
      link: function (originalScope, element, attrs, ngModel) {
        var closeOnDateSelection = angular.isDefined(attrs.closeOnDateSelection) ? scope.$eval(attrs.closeOnDateSelection) : datepickerPopupConfig.closeOnDateSelection;
        var dateFormat = attrs.datepickerPopup || datepickerPopupConfig.dateFormat;
        var scope = originalScope.$new();
        originalScope.$on('$destroy', function () {
          scope.$destroy();
        });
        var getIsOpen, setIsOpen;
        if (attrs.isOpen) {
          getIsOpen = $parse(attrs.isOpen);
          setIsOpen = getIsOpen.assign;
          originalScope.$watch(getIsOpen, function updateOpen(value) {
            scope.isOpen = !!value;
          });
        }
        scope.isOpen = getIsOpen ? getIsOpen(originalScope) : false;
        function setOpen(value) {
          if (setIsOpen) {
            setIsOpen(originalScope, !!value);
          } else {
            scope.isOpen = !!value;
          }
        }
        var documentClickBind = function (event) {
          if (scope.isOpen && event.target !== element[0]) {
            scope.$apply(function () {
              setOpen(false);
            });
          }
        };
        var elementFocusBind = function () {
          scope.$apply(function () {
            setOpen(true);
          });
        };
        var popupEl = angular.element('<datepicker-popup-wrap><datepicker></datepicker></datepicker-popup-wrap>');
        popupEl.attr({
          'ng-model': 'date',
          'ng-change': 'dateSelection()'
        });
        var datepickerEl = popupEl.find('datepicker');
        if (attrs.datepickerOptions) {
          datepickerEl.attr(angular.extend({}, originalScope.$eval(attrs.datepickerOptions)));
        }
        function parseDate(viewValue) {
          if (!viewValue) {
            ngModel.$setValidity('date', true);
            return null;
          } else if (angular.isDate(viewValue)) {
            ngModel.$setValidity('date', true);
            return viewValue;
          } else if (angular.isString(viewValue)) {
            var date = new Date(viewValue);
            if (isNaN(date)) {
              ngModel.$setValidity('date', false);
              return undefined;
            } else {
              ngModel.$setValidity('date', true);
              return date;
            }
          } else {
            ngModel.$setValidity('date', false);
            return undefined;
          }
        }
        ngModel.$parsers.unshift(parseDate);
        scope.dateSelection = function () {
          ngModel.$setViewValue(scope.date);
          ngModel.$render();
          if (closeOnDateSelection) {
            setOpen(false);
          }
        };
        element.bind('input change keyup', function () {
          scope.$apply(function () {
            updateCalendar();
          });
        });
        ngModel.$render = function () {
          var date = ngModel.$viewValue ? dateFilter(ngModel.$viewValue, dateFormat) : '';
          element.val(date);
          updateCalendar();
        };
        function updateCalendar() {
          scope.date = ngModel.$modelValue;
          updatePosition();
        }
        function addWatchableAttribute(attribute, scopeProperty, datepickerAttribute) {
          if (attribute) {
            originalScope.$watch($parse(attribute), function (value) {
              scope[scopeProperty] = value;
            });
            datepickerEl.attr(datepickerAttribute || scopeProperty, scopeProperty);
          }
        }
        addWatchableAttribute(attrs.min, 'min');
        addWatchableAttribute(attrs.max, 'max');
        if (attrs.showWeeks) {
          addWatchableAttribute(attrs.showWeeks, 'showWeeks', 'show-weeks');
        } else {
          scope.showWeeks = true;
          datepickerEl.attr('show-weeks', 'showWeeks');
        }
        if (attrs.dateDisabled) {
          datepickerEl.attr('date-disabled', attrs.dateDisabled);
        }
        function updatePosition() {
          scope.position = $position.position(element);
          scope.position.top = scope.position.top + element.prop('offsetHeight');
        }
        var documentBindingInitialized = false, elementFocusInitialized = false;
        scope.$watch('isOpen', function (value) {
          if (value) {
            updatePosition();
            $document.bind('click', documentClickBind);
            if (elementFocusInitialized) {
              element.unbind('focus', elementFocusBind);
            }
            element[0].focus();
            documentBindingInitialized = true;
          } else {
            if (documentBindingInitialized) {
              $document.unbind('click', documentClickBind);
            }
            element.bind('focus', elementFocusBind);
            elementFocusInitialized = true;
          }
          if (setIsOpen) {
            setIsOpen(originalScope, value);
          }
        });
        var $setModelValue = $parse(attrs.ngModel).assign;
        scope.today = function () {
          $setModelValue(originalScope, new Date());
        };
        scope.clear = function () {
          $setModelValue(originalScope, null);
        };
        element.after($compile(popupEl)(scope));
      }
    };
  }
]).directive('datepickerPopupWrap', [function () {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      templateUrl: 'template/datepicker/popup.html',
      link: function (scope, element, attrs) {
        element.bind('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
        });
      }
    };
  }]);
angular.module('ui.bootstrap.dropdownToggle', []).directive('dropdownToggle', [
  '$document',
  '$location',
  function ($document, $location) {
    var openElement = null, closeMenu = angular.noop;
    return {
      restrict: 'CA',
      link: function (scope, element, attrs) {
        scope.$watch('$location.path', function () {
          closeMenu();
        });
        element.parent().bind('click', function () {
          closeMenu();
        });
        element.bind('click', function (event) {
          var elementWasOpen = element === openElement;
          event.preventDefault();
          event.stopPropagation();
          if (!!openElement) {
            closeMenu();
          }
          if (!elementWasOpen) {
            element.parent().addClass('open');
            openElement = element;
            closeMenu = function (event) {
              if (event) {
                event.preventDefault();
                event.stopPropagation();
              }
              $document.unbind('click', closeMenu);
              element.parent().removeClass('open');
              closeMenu = angular.noop;
              openElement = null;
            };
            $document.bind('click', closeMenu);
          }
        });
      }
    };
  }
]);
angular.module('ui.bootstrap.modal', []).factory('$$stackedMap', function () {
  return {
    createNew: function () {
      var stack = [];
      return {
        add: function (key, value) {
          stack.push({
            key: key,
            value: value
          });
        },
        get: function (key) {
          for (var i = 0; i < stack.length; i++) {
            if (key == stack[i].key) {
              return stack[i];
            }
          }
        },
        keys: function () {
          var keys = [];
          for (var i = 0; i < stack.length; i++) {
            keys.push(stack[i].key);
          }
          return keys;
        },
        top: function () {
          return stack[stack.length - 1];
        },
        remove: function (key) {
          var idx = -1;
          for (var i = 0; i < stack.length; i++) {
            if (key == stack[i].key) {
              idx = i;
              break;
            }
          }
          return stack.splice(idx, 1)[0];
        },
        removeTop: function () {
          return stack.splice(stack.length - 1, 1)[0];
        },
        length: function () {
          return stack.length;
        }
      };
    }
  };
}).directive('modalBackdrop', [
  '$modalStack',
  '$timeout',
  function ($modalStack, $timeout) {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'views/modal/backdrop.html',
      link: function (scope, element, attrs) {
        $timeout(function () {
          scope.animate = true;
        });
        scope.close = function (evt) {
          var modal = $modalStack.getTop();
          if (modal && modal.value.backdrop && modal.value.backdrop != 'static') {
            evt.preventDefault();
            evt.stopPropagation();
            $modalStack.dismiss(modal.key, 'backdrop click');
          }
        };
      }
    };
  }
]).directive('modalWindow', [
  '$timeout',
  function ($timeout) {
    return {
      restrict: 'EA',
      scope: { index: '@' },
      replace: true,
      transclude: true,
      templateUrl: 'views/modal/window.html',
      link: function (scope, element, attrs) {
        scope.windowClass = attrs.windowClass || '';
        $timeout(function () {
          scope.animate = true;
        });
      }
    };
  }
]).factory('$modalStack', [
  '$document',
  '$compile',
  '$rootScope',
  '$$stackedMap',
  function ($document, $compile, $rootScope, $$stackedMap) {
    var backdropjqLiteEl, backdropDomEl;
    var backdropScope = $rootScope.$new(true);
    var body = $document.find('body').eq(0);
    var openedWindows = $$stackedMap.createNew();
    var $modalStack = {};
    function backdropIndex() {
      var topBackdropIndex = -1;
      var opened = openedWindows.keys();
      for (var i = 0; i < opened.length; i++) {
        if (openedWindows.get(opened[i]).value.backdrop) {
          topBackdropIndex = i;
        }
      }
      return topBackdropIndex;
    }
    $rootScope.$watch(backdropIndex, function (newBackdropIndex) {
      backdropScope.index = newBackdropIndex;
    });
    function removeModalWindow(modalInstance) {
      var modalWindow = openedWindows.get(modalInstance).value;
      openedWindows.remove(modalInstance);
      modalWindow.modalDomEl.remove();
      if (backdropIndex() == -1) {
        backdropDomEl.remove();
        backdropDomEl = undefined;
      }
      modalWindow.modalScope.$destroy();
    }
    $document.bind('keydown', function (evt) {
      var modal;
      if (evt.which === 27) {
        modal = openedWindows.top();
        if (modal && modal.value.keyboard) {
          $rootScope.$apply(function () {
            $modalStack.dismiss(modal.key);
          });
        }
      }
    });
    $modalStack.open = function (modalInstance, modal) {
      openedWindows.add(modalInstance, {
        deferred: modal.deferred,
        modalScope: modal.scope,
        backdrop: modal.backdrop,
        keyboard: modal.keyboard
      });
      var angularDomEl = angular.element('<div modal-window></div>');
      angularDomEl.attr('window-class', modal.windowClass);
      angularDomEl.attr('index', openedWindows.length() - 1);
      angularDomEl.html(modal.content);
      var modalDomEl = $compile(angularDomEl)(modal.scope);
      openedWindows.top().value.modalDomEl = modalDomEl;
      body.append(modalDomEl);
      if (backdropIndex() >= 0 && !backdropDomEl) {
        backdropjqLiteEl = angular.element('<div modal-backdrop></div>');
        backdropDomEl = $compile(backdropjqLiteEl)(backdropScope);
        body.append(backdropDomEl);
      }
    };
    $modalStack.close = function (modalInstance, result) {
      var modal = openedWindows.get(modalInstance);
      if (modal) {
        modal.value.deferred.resolve(result);
        removeModalWindow(modalInstance);
      }
    };
    $modalStack.dismiss = function (modalInstance, reason) {
      var modalWindow = openedWindows.get(modalInstance).value;
      if (modalWindow) {
        modalWindow.deferred.reject(reason);
        removeModalWindow(modalInstance);
      }
    };
    $modalStack.getTop = function () {
      return openedWindows.top();
    };
    return $modalStack;
  }
]).provider('$modal', function () {
  var $modalProvider = {
      options: {
        backdrop: true,
        keyboard: true
      },
      $get: [
        '$injector',
        '$rootScope',
        '$q',
        '$http',
        '$templateCache',
        '$controller',
        '$modalStack',
        function ($injector, $rootScope, $q, $http, $templateCache, $controller, $modalStack) {
          var $modal = {};
          function getTemplatePromise(options) {
            return options.template ? $q.when(options.template) : $http.get(options.templateUrl, { cache: $templateCache }).then(function (result) {
              return result.data;
            });
          }
          function getResolvePromises(resolves) {
            var promisesArr = [];
            angular.forEach(resolves, function (value, key) {
              if (angular.isFunction(value) || angular.isArray(value)) {
                promisesArr.push($q.when($injector.invoke(value)));
              }
            });
            return promisesArr;
          }
          $modal.open = function (modalOptions) {
            var modalResultDeferred = $q.defer();
            var modalOpenedDeferred = $q.defer();
            var modalInstance = {
                result: modalResultDeferred.promise,
                opened: modalOpenedDeferred.promise,
                close: function (result) {
                  $modalStack.close(modalInstance, result);
                },
                dismiss: function (reason) {
                  $modalStack.dismiss(modalInstance, reason);
                }
              };
            modalOptions = angular.extend({}, $modalProvider.options, modalOptions);
            modalOptions.resolve = modalOptions.resolve || {};
            if (!modalOptions.template && !modalOptions.templateUrl) {
              throw new Error('One of template or templateUrl options is required.');
            }
            var templateAndResolvePromise = $q.all([getTemplatePromise(modalOptions)].concat(getResolvePromises(modalOptions.resolve)));
            templateAndResolvePromise.then(function resolveSuccess(tplAndVars) {
              var modalScope = (modalOptions.scope || $rootScope).$new();
              modalScope.$close = modalInstance.close;
              modalScope.$dismiss = modalInstance.dismiss;
              var ctrlInstance, ctrlLocals = {};
              var resolveIter = 1;
              if (modalOptions.controller) {
                ctrlLocals.$scope = modalScope;
                ctrlLocals.$modalInstance = modalInstance;
                angular.forEach(modalOptions.resolve, function (value, key) {
                  ctrlLocals[key] = tplAndVars[resolveIter++];
                });
                ctrlInstance = $controller(modalOptions.controller, ctrlLocals);
              }
              $modalStack.open(modalInstance, {
                scope: modalScope,
                deferred: modalResultDeferred,
                content: tplAndVars[0],
                backdrop: modalOptions.backdrop,
                keyboard: modalOptions.keyboard,
                windowClass: modalOptions.windowClass
              });
            }, function resolveError(reason) {
              modalResultDeferred.reject(reason);
            });
            templateAndResolvePromise.then(function () {
              modalOpenedDeferred.resolve(true);
            }, function () {
              modalOpenedDeferred.reject(false);
            });
            return modalInstance;
          };
          return $modal;
        }
      ]
    };
  return $modalProvider;
});
angular.module('ui.bootstrap.pagination', []).controller('PaginationController', [
  '$scope',
  '$attrs',
  '$parse',
  '$interpolate',
  function ($scope, $attrs, $parse, $interpolate) {
    var self = this;
    this.init = function (defaultItemsPerPage) {
      if ($attrs.itemsPerPage) {
        $scope.$parent.$watch($parse($attrs.itemsPerPage), function (value) {
          self.itemsPerPage = parseInt(value, 10);
          $scope.totalPages = self.calculateTotalPages();
        });
      } else {
        this.itemsPerPage = defaultItemsPerPage;
      }
    };
    this.noPrevious = function () {
      return this.page === 1;
    };
    this.noNext = function () {
      return this.page === $scope.totalPages;
    };
    this.isActive = function (page) {
      return this.page === page;
    };
    this.calculateTotalPages = function () {
      return this.itemsPerPage < 1 ? 1 : Math.ceil($scope.totalItems / this.itemsPerPage);
    };
    this.getAttributeValue = function (attribute, defaultValue, interpolate) {
      return angular.isDefined(attribute) ? interpolate ? $interpolate(attribute)($scope.$parent) : $scope.$parent.$eval(attribute) : defaultValue;
    };
    this.render = function () {
      this.page = parseInt($scope.page, 10) || 1;
      $scope.pages = this.getPages(this.page, $scope.totalPages);
    };
    $scope.selectPage = function (page) {
      if (!self.isActive(page) && page > 0 && page <= $scope.totalPages) {
        $scope.page = page;
        $scope.onSelectPage({ page: page });
      }
    };
    $scope.$watch('totalItems', function () {
      $scope.totalPages = self.calculateTotalPages();
    });
    $scope.$watch('totalPages', function (value) {
      if ($attrs.numPages) {
        $scope.numPages = value;
      }
      if (self.page > value) {
        $scope.selectPage(value);
      } else {
        self.render();
      }
    });
    $scope.$watch('page', function () {
      self.render();
    });
  }
]).constant('paginationConfig', {
  itemsPerPage: 10,
  boundaryLinks: false,
  directionLinks: true,
  firstText: 'First',
  previousText: 'Previous',
  nextText: 'Next',
  lastText: 'Last',
  rotate: true
}).directive('pagination', [
  '$parse',
  'paginationConfig',
  function ($parse, config) {
    return {
      restrict: 'EA',
      scope: {
        page: '=',
        totalItems: '=',
        onSelectPage: ' &',
        numPages: '='
      },
      controller: 'PaginationController',
      templateUrl: 'template/pagination/pagination.html',
      replace: true,
      link: function (scope, element, attrs, paginationCtrl) {
        var maxSize, boundaryLinks = paginationCtrl.getAttributeValue(attrs.boundaryLinks, config.boundaryLinks), directionLinks = paginationCtrl.getAttributeValue(attrs.directionLinks, config.directionLinks), firstText = paginationCtrl.getAttributeValue(attrs.firstText, config.firstText, true), previousText = paginationCtrl.getAttributeValue(attrs.previousText, config.previousText, true), nextText = paginationCtrl.getAttributeValue(attrs.nextText, config.nextText, true), lastText = paginationCtrl.getAttributeValue(attrs.lastText, config.lastText, true), rotate = paginationCtrl.getAttributeValue(attrs.rotate, config.rotate);
        paginationCtrl.init(config.itemsPerPage);
        if (attrs.maxSize) {
          scope.$parent.$watch($parse(attrs.maxSize), function (value) {
            maxSize = parseInt(value, 10);
            paginationCtrl.render();
          });
        }
        function makePage(number, text, isActive, isDisabled) {
          return {
            number: number,
            text: text,
            active: isActive,
            disabled: isDisabled
          };
        }
        paginationCtrl.getPages = function (currentPage, totalPages) {
          var pages = [];
          var startPage = 1, endPage = totalPages;
          var isMaxSized = angular.isDefined(maxSize) && maxSize < totalPages;
          if (isMaxSized) {
            if (rotate) {
              startPage = Math.max(currentPage - Math.floor(maxSize / 2), 1);
              endPage = startPage + maxSize - 1;
              if (endPage > totalPages) {
                endPage = totalPages;
                startPage = endPage - maxSize + 1;
              }
            } else {
              startPage = (Math.ceil(currentPage / maxSize) - 1) * maxSize + 1;
              endPage = Math.min(startPage + maxSize - 1, totalPages);
            }
          }
          for (var number = startPage; number <= endPage; number++) {
            var page = makePage(number, number, paginationCtrl.isActive(number), false);
            pages.push(page);
          }
          if (isMaxSized && !rotate) {
            if (startPage > 1) {
              var previousPageSet = makePage(startPage - 1, '...', false, false);
              pages.unshift(previousPageSet);
            }
            if (endPage < totalPages) {
              var nextPageSet = makePage(endPage + 1, '...', false, false);
              pages.push(nextPageSet);
            }
          }
          if (directionLinks) {
            var previousPage = makePage(currentPage - 1, previousText, false, paginationCtrl.noPrevious());
            pages.unshift(previousPage);
            var nextPage = makePage(currentPage + 1, nextText, false, paginationCtrl.noNext());
            pages.push(nextPage);
          }
          if (boundaryLinks) {
            var firstPage = makePage(1, firstText, false, paginationCtrl.noPrevious());
            pages.unshift(firstPage);
            var lastPage = makePage(totalPages, lastText, false, paginationCtrl.noNext());
            pages.push(lastPage);
          }
          return pages;
        };
      }
    };
  }
]).constant('pagerConfig', {
  itemsPerPage: 10,
  previousText: '\xab Previous',
  nextText: 'Next \xbb',
  align: true
}).directive('pager', [
  'pagerConfig',
  function (config) {
    return {
      restrict: 'EA',
      scope: {
        page: '=',
        totalItems: '=',
        onSelectPage: ' &',
        numPages: '='
      },
      controller: 'PaginationController',
      templateUrl: 'template/pagination/pager.html',
      replace: true,
      link: function (scope, element, attrs, paginationCtrl) {
        var previousText = paginationCtrl.getAttributeValue(attrs.previousText, config.previousText, true), nextText = paginationCtrl.getAttributeValue(attrs.nextText, config.nextText, true), align = paginationCtrl.getAttributeValue(attrs.align, config.align);
        paginationCtrl.init(config.itemsPerPage);
        function makePage(number, text, isDisabled, isPrevious, isNext) {
          return {
            number: number,
            text: text,
            disabled: isDisabled,
            previous: align && isPrevious,
            next: align && isNext
          };
        }
        paginationCtrl.getPages = function (currentPage) {
          return [
            makePage(currentPage - 1, previousText, paginationCtrl.noPrevious(), true, false),
            makePage(currentPage + 1, nextText, paginationCtrl.noNext(), false, true)
          ];
        };
      }
    };
  }
]);
angular.module('ui.bootstrap.tooltip', [
  'ui.bootstrap.position',
  'ui.bootstrap.bindHtml'
]).provider('$tooltip', function () {
  var defaultOptions = {
      placement: 'top',
      animation: true,
      popupDelay: 0
    };
  var triggerMap = {
      'mouseenter': 'mouseleave',
      'click': 'click',
      'focus': 'blur'
    };
  var globalOptions = {};
  this.options = function (value) {
    angular.extend(globalOptions, value);
  };
  this.setTriggers = function setTriggers(triggers) {
    angular.extend(triggerMap, triggers);
  };
  function snake_case(name) {
    var regexp = /[A-Z]/g;
    var separator = '-';
    return name.replace(regexp, function (letter, pos) {
      return (pos ? separator : '') + letter.toLowerCase();
    });
  }
  this.$get = [
    '$window',
    '$compile',
    '$timeout',
    '$parse',
    '$document',
    '$position',
    '$interpolate',
    function ($window, $compile, $timeout, $parse, $document, $position, $interpolate) {
      return function $tooltip(type, prefix, defaultTriggerShow) {
        var options = angular.extend({}, defaultOptions, globalOptions);
        function getTriggers(trigger) {
          var show = trigger || options.trigger || defaultTriggerShow;
          var hide = triggerMap[show] || show;
          return {
            show: show,
            hide: hide
          };
        }
        var directiveName = snake_case(type);
        var startSym = $interpolate.startSymbol();
        var endSym = $interpolate.endSymbol();
        var template = '<' + directiveName + '-popup ' + 'title="' + startSym + 'tt_title' + endSym + '" ' + 'content="' + startSym + 'tt_content' + endSym + '" ' + 'placement="' + startSym + 'tt_placement' + endSym + '" ' + 'animation="tt_animation()" ' + 'is-open="tt_isOpen"' + '>' + '</' + directiveName + '-popup>';
        return {
          restrict: 'EA',
          scope: true,
          link: function link(scope, element, attrs) {
            var tooltip = $compile(template)(scope);
            var transitionTimeout;
            var popupTimeout;
            var $body;
            var appendToBody = angular.isDefined(options.appendToBody) ? options.appendToBody : false;
            var triggers = getTriggers(undefined);
            var hasRegisteredTriggers = false;
            scope.tt_isOpen = false;
            function toggleTooltipBind() {
              if (!scope.tt_isOpen) {
                showTooltipBind();
              } else {
                hideTooltipBind();
              }
            }
            function showTooltipBind() {
              if (scope.tt_popupDelay) {
                popupTimeout = $timeout(show, scope.tt_popupDelay);
              } else {
                scope.$apply(show);
              }
            }
            function hideTooltipBind() {
              scope.$apply(function () {
                hide();
              });
            }
            function show() {
              var position, ttWidth, ttHeight, ttPosition;
              if (!scope.tt_content) {
                return;
              }
              if (transitionTimeout) {
                $timeout.cancel(transitionTimeout);
              }
              tooltip.css({
                top: 0,
                left: 0,
                display: 'block'
              });
              if (appendToBody) {
                $body = $body || $document.find('body');
                $body.append(tooltip);
              } else {
                element.after(tooltip);
              }
              position = appendToBody ? $position.offset(element) : $position.position(element);
              ttWidth = tooltip.prop('offsetWidth');
              ttHeight = tooltip.prop('offsetHeight');
              switch (scope.tt_placement) {
              case 'right':
                ttPosition = {
                  top: position.top + position.height / 2 - ttHeight / 2,
                  left: position.left + position.width
                };
                break;
              case 'bottom':
                ttPosition = {
                  top: position.top + position.height,
                  left: position.left + position.width / 2 - ttWidth / 2
                };
                break;
              case 'left':
                ttPosition = {
                  top: position.top + position.height / 2 - ttHeight / 2,
                  left: position.left - ttWidth
                };
                break;
              default:
                ttPosition = {
                  top: position.top - ttHeight,
                  left: position.left + position.width / 2 - ttWidth / 2
                };
                break;
              }
              ttPosition.top += 'px';
              ttPosition.left += 'px';
              tooltip.css(ttPosition);
              scope.tt_isOpen = true;
            }
            function hide() {
              scope.tt_isOpen = false;
              $timeout.cancel(popupTimeout);
              if (angular.isDefined(scope.tt_animation) && scope.tt_animation()) {
                transitionTimeout = $timeout(function () {
                  tooltip.remove();
                }, 500);
              } else {
                tooltip.remove();
              }
            }
            attrs.$observe(type, function (val) {
              scope.tt_content = val;
            });
            attrs.$observe(prefix + 'Title', function (val) {
              scope.tt_title = val;
            });
            attrs.$observe(prefix + 'Placement', function (val) {
              scope.tt_placement = angular.isDefined(val) ? val : options.placement;
            });
            attrs.$observe(prefix + 'Animation', function (val) {
              scope.tt_animation = angular.isDefined(val) ? $parse(val) : function () {
                return options.animation;
              };
            });
            attrs.$observe(prefix + 'PopupDelay', function (val) {
              var delay = parseInt(val, 10);
              scope.tt_popupDelay = !isNaN(delay) ? delay : options.popupDelay;
            });
            attrs.$observe(prefix + 'Trigger', function (val) {
              if (hasRegisteredTriggers) {
                element.unbind(triggers.show, showTooltipBind);
                element.unbind(triggers.hide, hideTooltipBind);
              }
              triggers = getTriggers(val);
              if (triggers.show === triggers.hide) {
                element.bind(triggers.show, toggleTooltipBind);
              } else {
                element.bind(triggers.show, showTooltipBind);
                element.bind(triggers.hide, hideTooltipBind);
              }
              hasRegisteredTriggers = true;
            });
            attrs.$observe(prefix + 'AppendToBody', function (val) {
              appendToBody = angular.isDefined(val) ? $parse(val)(scope) : appendToBody;
            });
            if (appendToBody) {
              scope.$on('$locationChangeSuccess', function closeTooltipOnLocationChangeSuccess() {
                if (scope.tt_isOpen) {
                  hide();
                }
              });
            }
            scope.$on('$destroy', function onDestroyTooltip() {
              if (scope.tt_isOpen) {
                hide();
              } else {
                tooltip.remove();
              }
            });
          }
        };
      };
    }
  ];
}).directive('tooltipPopup', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      content: '@',
      placement: '@',
      animation: '&',
      isOpen: '&'
    },
    templateUrl: 'template/tooltip/tooltip-popup.html'
  };
}).directive('tooltip', [
  '$tooltip',
  function ($tooltip) {
    return $tooltip('tooltip', 'tooltip', 'mouseenter');
  }
]).directive('tooltipHtmlUnsafePopup', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      content: '@',
      placement: '@',
      animation: '&',
      isOpen: '&'
    },
    templateUrl: 'template/tooltip/tooltip-html-unsafe-popup.html'
  };
}).directive('tooltipHtmlUnsafe', [
  '$tooltip',
  function ($tooltip) {
    return $tooltip('tooltipHtmlUnsafe', 'tooltip', 'mouseenter');
  }
]);
angular.module('ui.bootstrap.popover', ['ui.bootstrap.tooltip']).directive('popoverPopup', function () {
  return {
    restrict: 'EA',
    replace: true,
    scope: {
      title: '@',
      content: '@',
      placement: '@',
      animation: '&',
      isOpen: '&'
    },
    templateUrl: 'views/popover/popover.html'
  };
}).directive('popover', [
  '$compile',
  '$timeout',
  '$parse',
  '$window',
  '$tooltip',
  function ($compile, $timeout, $parse, $window, $tooltip) {
    return $tooltip('popover', 'popover', 'click');
  }
]);
angular.module('ui.bootstrap.progressbar', ['ui.bootstrap.transition']).constant('progressConfig', {
  animate: true,
  autoType: false,
  stackedTypes: [
    'success',
    'info',
    'warning',
    'danger'
  ]
}).controller('ProgressBarController', [
  '$scope',
  '$attrs',
  'progressConfig',
  function ($scope, $attrs, progressConfig) {
    var animate = angular.isDefined($attrs.animate) ? $scope.$eval($attrs.animate) : progressConfig.animate;
    var autoType = angular.isDefined($attrs.autoType) ? $scope.$eval($attrs.autoType) : progressConfig.autoType;
    var stackedTypes = angular.isDefined($attrs.stackedTypes) ? $scope.$eval('[' + $attrs.stackedTypes + ']') : progressConfig.stackedTypes;
    this.makeBar = function (newBar, oldBar, index) {
      var newValue = angular.isObject(newBar) ? newBar.value : newBar || 0;
      var oldValue = angular.isObject(oldBar) ? oldBar.value : oldBar || 0;
      var type = angular.isObject(newBar) && angular.isDefined(newBar.type) ? newBar.type : autoType ? getStackedType(index || 0) : null;
      return {
        from: oldValue,
        to: newValue,
        type: type,
        animate: animate
      };
    };
    function getStackedType(index) {
      return stackedTypes[index];
    }
    this.addBar = function (bar) {
      $scope.bars.push(bar);
      $scope.totalPercent += bar.to;
    };
    this.clearBars = function () {
      $scope.bars = [];
      $scope.totalPercent = 0;
    };
    this.clearBars();
  }
]).directive('progress', function () {
  return {
    restrict: 'EA',
    replace: true,
    controller: 'ProgressBarController',
    scope: {
      value: '=percent',
      onFull: '&',
      onEmpty: '&'
    },
    templateUrl: 'template/progressbar/progress.html',
    link: function (scope, element, attrs, controller) {
      scope.$watch('value', function (newValue, oldValue) {
        controller.clearBars();
        if (angular.isArray(newValue)) {
          for (var i = 0, n = newValue.length; i < n; i++) {
            controller.addBar(controller.makeBar(newValue[i], oldValue[i], i));
          }
        } else {
          controller.addBar(controller.makeBar(newValue, oldValue));
        }
      }, true);
      scope.$watch('totalPercent', function (value) {
        if (value >= 100) {
          scope.onFull();
        } else if (value <= 0) {
          scope.onEmpty();
        }
      }, true);
    }
  };
}).directive('progressbar', [
  '$transition',
  function ($transition) {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        width: '=',
        old: '=',
        type: '=',
        animate: '='
      },
      templateUrl: 'template/progressbar/bar.html',
      link: function (scope, element) {
        scope.$watch('width', function (value) {
          if (scope.animate) {
            element.css('width', scope.old + '%');
            $transition(element, { width: value + '%' });
          } else {
            element.css('width', value + '%');
          }
        });
      }
    };
  }
]);
angular.module('ui.bootstrap.rating', []).constant('ratingConfig', {
  max: 5,
  stateOn: null,
  stateOff: null
}).controller('RatingController', [
  '$scope',
  '$attrs',
  '$parse',
  'ratingConfig',
  function ($scope, $attrs, $parse, ratingConfig) {
    this.maxRange = angular.isDefined($attrs.max) ? $scope.$parent.$eval($attrs.max) : ratingConfig.max;
    this.stateOn = angular.isDefined($attrs.stateOn) ? $scope.$parent.$eval($attrs.stateOn) : ratingConfig.stateOn;
    this.stateOff = angular.isDefined($attrs.stateOff) ? $scope.$parent.$eval($attrs.stateOff) : ratingConfig.stateOff;
    this.createDefaultRange = function (len) {
      var defaultStateObject = {
          stateOn: this.stateOn,
          stateOff: this.stateOff
        };
      var states = new Array(len);
      for (var i = 0; i < len; i++) {
        states[i] = defaultStateObject;
      }
      return states;
    };
    this.normalizeRange = function (states) {
      for (var i = 0, n = states.length; i < n; i++) {
        states[i].stateOn = states[i].stateOn || this.stateOn;
        states[i].stateOff = states[i].stateOff || this.stateOff;
      }
      return states;
    };
    $scope.range = angular.isDefined($attrs.ratingStates) ? this.normalizeRange(angular.copy($scope.$parent.$eval($attrs.ratingStates))) : this.createDefaultRange(this.maxRange);
    $scope.rate = function (value) {
      if ($scope.readonly || $scope.value === value) {
        return;
      }
      $scope.value = value;
    };
    $scope.enter = function (value) {
      if (!$scope.readonly) {
        $scope.val = value;
      }
      $scope.onHover({ value: value });
    };
    $scope.reset = function () {
      $scope.val = angular.copy($scope.value);
      $scope.onLeave();
    };
    $scope.$watch('value', function (value) {
      $scope.val = value;
    });
    $scope.readonly = false;
    if ($attrs.readonly) {
      $scope.$parent.$watch($parse($attrs.readonly), function (value) {
        $scope.readonly = !!value;
      });
    }
  }
]).directive('rating', function () {
  return {
    restrict: 'EA',
    scope: {
      value: '=',
      onHover: '&',
      onLeave: '&'
    },
    controller: 'RatingController',
    templateUrl: 'template/rating/rating.html',
    replace: true
  };
});
angular.module('ui.bootstrap.tabs', []).directive('tabs', function () {
  return function () {
    throw new Error('The `tabs` directive is deprecated, please migrate to `tabset`. Instructions can be found at http://github.com/angular-ui/bootstrap/tree/master/CHANGELOG.md');
  };
}).controller('TabsetController', [
  '$scope',
  '$element',
  function TabsetCtrl($scope, $element) {
    var ctrl = this, tabs = ctrl.tabs = $scope.tabs = [];
    ctrl.select = function (tab) {
      angular.forEach(tabs, function (tab) {
        tab.active = false;
      });
      tab.active = true;
    };
    ctrl.addTab = function addTab(tab) {
      tabs.push(tab);
      if (tabs.length === 1 || tab.active) {
        ctrl.select(tab);
      }
    };
    ctrl.removeTab = function removeTab(tab) {
      var index = tabs.indexOf(tab);
      if (tab.active && tabs.length > 1) {
        var newActiveIndex = index == tabs.length - 1 ? index - 1 : index + 1;
        ctrl.select(tabs[newActiveIndex]);
      }
      tabs.splice(index, 1);
    };
  }
]).directive('tabset', function () {
  return {
    restrict: 'EA',
    transclude: true,
    replace: true,
    require: '^tabset',
    scope: {},
    controller: 'TabsetController',
    templateUrl: 'template/tabs/tabset.html',
    compile: function (elm, attrs, transclude) {
      return function (scope, element, attrs, tabsetCtrl) {
        scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent.$eval(attrs.vertical) : false;
        scope.type = angular.isDefined(attrs.type) ? scope.$parent.$eval(attrs.type) : 'tabs';
        scope.direction = angular.isDefined(attrs.direction) ? scope.$parent.$eval(attrs.direction) : 'top';
        scope.tabsAbove = scope.direction != 'below';
        tabsetCtrl.$scope = scope;
        tabsetCtrl.$transcludeFn = transclude;
      };
    }
  };
}).directive('tab', [
  '$parse',
  '$http',
  '$templateCache',
  '$compile',
  function ($parse, $http, $templateCache, $compile) {
    return {
      require: '^tabset',
      restrict: 'EA',
      replace: true,
      templateUrl: 'template/tabs/tab.html',
      transclude: true,
      scope: {
        heading: '@',
        onSelect: '&select',
        onDeselect: '&deselect'
      },
      controller: function () {
      },
      compile: function (elm, attrs, transclude) {
        return function postLink(scope, elm, attrs, tabsetCtrl) {
          var getActive, setActive;
          if (attrs.active) {
            getActive = $parse(attrs.active);
            setActive = getActive.assign;
            scope.$parent.$watch(getActive, function updateActive(value) {
              scope.active = !!value;
            });
            scope.active = getActive(scope.$parent);
          } else {
            setActive = getActive = angular.noop;
          }
          scope.$watch('active', function (active) {
            setActive(scope.$parent, active);
            if (active) {
              tabsetCtrl.select(scope);
              scope.onSelect();
            } else {
              scope.onDeselect();
            }
          });
          scope.disabled = false;
          if (attrs.disabled) {
            scope.$parent.$watch($parse(attrs.disabled), function (value) {
              scope.disabled = !!value;
            });
          }
          scope.select = function () {
            if (!scope.disabled) {
              scope.active = true;
            }
          };
          tabsetCtrl.addTab(scope);
          scope.$on('$destroy', function () {
            tabsetCtrl.removeTab(scope);
          });
          if (scope.active) {
            setActive(scope.$parent, true);
          }
          scope.$transcludeFn = transclude;
        };
      }
    };
  }
]).directive('tabHeadingTransclude', [function () {
    return {
      restrict: 'A',
      require: '^tab',
      link: function (scope, elm, attrs, tabCtrl) {
        scope.$watch('headingElement', function updateHeadingElement(heading) {
          if (heading) {
            elm.html('');
            elm.append(heading);
          }
        });
      }
    };
  }]).directive('tabContentTransclude', [
  '$compile',
  '$parse',
  function ($compile, $parse) {
    return {
      restrict: 'A',
      require: '^tabset',
      link: function (scope, elm, attrs) {
        var tab = scope.$eval(attrs.tabContentTransclude);
        tab.$transcludeFn(tab.$parent, function (contents) {
          angular.forEach(contents, function (node) {
            if (isTabHeading(node)) {
              tab.headingElement = node;
            } else {
              elm.append(node);
            }
          });
        });
      }
    };
    function isTabHeading(node) {
      return node.tagName && (node.hasAttribute('tab-heading') || node.hasAttribute('data-tab-heading') || node.tagName.toLowerCase() === 'tab-heading' || node.tagName.toLowerCase() === 'data-tab-heading');
    }
  }
]).directive('tabsetTitles', [
  '$http',
  function ($http) {
    return {
      restrict: 'A',
      require: '^tabset',
      templateUrl: 'template/tabs/tabset-titles.html',
      replace: true,
      link: function (scope, elm, attrs, tabsetCtrl) {
        if (!scope.$eval(attrs.tabsetTitles)) {
          elm.remove();
        } else {
          tabsetCtrl.$transcludeFn(tabsetCtrl.$scope.$parent, function (node) {
            elm.append(node);
          });
        }
      }
    };
  }
]);
;
angular.module('ui.bootstrap.timepicker', []).constant('timepickerConfig', {
  hourStep: 1,
  minuteStep: 1,
  showMeridian: true,
  meridians: [
    'AM',
    'PM'
  ],
  readonlyInput: false,
  mousewheel: true
}).directive('timepicker', [
  '$parse',
  '$log',
  'timepickerConfig',
  function ($parse, $log, timepickerConfig) {
    return {
      restrict: 'EA',
      require: '?^ngModel',
      replace: true,
      scope: {},
      templateUrl: 'template/timepicker/timepicker.html',
      link: function (scope, element, attrs, ngModel) {
        if (!ngModel) {
          return;
        }
        var selected = new Date(), meridians = timepickerConfig.meridians;
        var hourStep = timepickerConfig.hourStep;
        if (attrs.hourStep) {
          scope.$parent.$watch($parse(attrs.hourStep), function (value) {
            hourStep = parseInt(value, 10);
          });
        }
        var minuteStep = timepickerConfig.minuteStep;
        if (attrs.minuteStep) {
          scope.$parent.$watch($parse(attrs.minuteStep), function (value) {
            minuteStep = parseInt(value, 10);
          });
        }
        scope.showMeridian = timepickerConfig.showMeridian;
        if (attrs.showMeridian) {
          scope.$parent.$watch($parse(attrs.showMeridian), function (value) {
            scope.showMeridian = !!value;
            if (ngModel.$error.time) {
              var hours = getHoursFromTemplate(), minutes = getMinutesFromTemplate();
              if (angular.isDefined(hours) && angular.isDefined(minutes)) {
                selected.setHours(hours);
                refresh();
              }
            } else {
              updateTemplate();
            }
          });
        }
        function getHoursFromTemplate() {
          var hours = parseInt(scope.hours, 10);
          var valid = scope.showMeridian ? hours > 0 && hours < 13 : hours >= 0 && hours < 24;
          if (!valid) {
            return undefined;
          }
          if (scope.showMeridian) {
            if (hours === 12) {
              hours = 0;
            }
            if (scope.meridian === meridians[1]) {
              hours = hours + 12;
            }
          }
          return hours;
        }
        function getMinutesFromTemplate() {
          var minutes = parseInt(scope.minutes, 10);
          return minutes >= 0 && minutes < 60 ? minutes : undefined;
        }
        function pad(value) {
          return angular.isDefined(value) && value.toString().length < 2 ? '0' + value : value;
        }
        var inputs = element.find('input'), hoursInputEl = inputs.eq(0), minutesInputEl = inputs.eq(1);
        var mousewheel = angular.isDefined(attrs.mousewheel) ? scope.$eval(attrs.mousewheel) : timepickerConfig.mousewheel;
        if (mousewheel) {
          var isScrollingUp = function (e) {
            if (e.originalEvent) {
              e = e.originalEvent;
            }
            var delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;
            return e.detail || delta > 0;
          };
          hoursInputEl.bind('mousewheel wheel', function (e) {
            scope.$apply(isScrollingUp(e) ? scope.incrementHours() : scope.decrementHours());
            e.preventDefault();
          });
          minutesInputEl.bind('mousewheel wheel', function (e) {
            scope.$apply(isScrollingUp(e) ? scope.incrementMinutes() : scope.decrementMinutes());
            e.preventDefault();
          });
        }
        scope.readonlyInput = angular.isDefined(attrs.readonlyInput) ? scope.$eval(attrs.readonlyInput) : timepickerConfig.readonlyInput;
        if (!scope.readonlyInput) {
          var invalidate = function (invalidHours, invalidMinutes) {
            ngModel.$setViewValue(null);
            ngModel.$setValidity('time', false);
            if (angular.isDefined(invalidHours)) {
              scope.invalidHours = invalidHours;
            }
            if (angular.isDefined(invalidMinutes)) {
              scope.invalidMinutes = invalidMinutes;
            }
          };
          scope.updateHours = function () {
            var hours = getHoursFromTemplate();
            if (angular.isDefined(hours)) {
              selected.setHours(hours);
              refresh('h');
            } else {
              invalidate(true);
            }
          };
          hoursInputEl.bind('blur', function (e) {
            if (!scope.validHours && scope.hours < 10) {
              scope.$apply(function () {
                scope.hours = pad(scope.hours);
              });
            }
          });
          scope.updateMinutes = function () {
            var minutes = getMinutesFromTemplate();
            if (angular.isDefined(minutes)) {
              selected.setMinutes(minutes);
              refresh('m');
            } else {
              invalidate(undefined, true);
            }
          };
          minutesInputEl.bind('blur', function (e) {
            if (!scope.invalidMinutes && scope.minutes < 10) {
              scope.$apply(function () {
                scope.minutes = pad(scope.minutes);
              });
            }
          });
        } else {
          scope.updateHours = angular.noop;
          scope.updateMinutes = angular.noop;
        }
        ngModel.$render = function () {
          var date = ngModel.$modelValue ? new Date(ngModel.$modelValue) : null;
          if (isNaN(date)) {
            ngModel.$setValidity('time', false);
            $log.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
          } else {
            if (date) {
              selected = date;
            }
            makeValid();
            updateTemplate();
          }
        };
        function refresh(keyboardChange) {
          makeValid();
          ngModel.$setViewValue(new Date(selected));
          updateTemplate(keyboardChange);
        }
        function makeValid() {
          ngModel.$setValidity('time', true);
          scope.invalidHours = false;
          scope.invalidMinutes = false;
        }
        function updateTemplate(keyboardChange) {
          var hours = selected.getHours(), minutes = selected.getMinutes();
          if (scope.showMeridian) {
            hours = hours === 0 || hours === 12 ? 12 : hours % 12;
          }
          scope.hours = keyboardChange === 'h' ? hours : pad(hours);
          scope.minutes = keyboardChange === 'm' ? minutes : pad(minutes);
          scope.meridian = selected.getHours() < 12 ? meridians[0] : meridians[1];
        }
        function addMinutes(minutes) {
          var dt = new Date(selected.getTime() + minutes * 60000);
          selected.setHours(dt.getHours(), dt.getMinutes());
          refresh();
        }
        scope.incrementHours = function () {
          addMinutes(hourStep * 60);
        };
        scope.decrementHours = function () {
          addMinutes(-hourStep * 60);
        };
        scope.incrementMinutes = function () {
          addMinutes(minuteStep);
        };
        scope.decrementMinutes = function () {
          addMinutes(-minuteStep);
        };
        scope.toggleMeridian = function () {
          addMinutes(12 * 60 * (selected.getHours() < 12 ? 1 : -1));
        };
      }
    };
  }
]);
angular.module('ui.bootstrap.typeahead', [
  'ui.bootstrap.position',
  'ui.bootstrap.bindHtml'
]).factory('typeaheadParser', [
  '$parse',
  function ($parse) {
    var TYPEAHEAD_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/;
    return {
      parse: function (input) {
        var match = input.match(TYPEAHEAD_REGEXP), modelMapper, viewMapper, source;
        if (!match) {
          throw new Error('Expected typeahead specification in form of \'_modelValue_ (as _label_)? for _item_ in _collection_\'' + ' but got \'' + input + '\'.');
        }
        return {
          itemName: match[3],
          source: $parse(match[4]),
          viewMapper: $parse(match[2] || match[1]),
          modelMapper: $parse(match[1])
        };
      }
    };
  }
]).directive('typeahead', [
  '$compile',
  '$parse',
  '$q',
  '$timeout',
  '$document',
  '$position',
  'typeaheadParser',
  function ($compile, $parse, $q, $timeout, $document, $position, typeaheadParser) {
    var HOT_KEYS = [
        9,
        13,
        27,
        38,
        40
      ];
    return {
      require: 'ngModel',
      link: function (originalScope, element, attrs, modelCtrl) {
        var minSearch = originalScope.$eval(attrs.typeaheadMinLength) || 1;
        var waitTime = originalScope.$eval(attrs.typeaheadWaitMs) || 0;
        var isEditable = originalScope.$eval(attrs.typeaheadEditable) !== false;
        var isLoadingSetter = $parse(attrs.typeaheadLoading).assign || angular.noop;
        var onSelectCallback = $parse(attrs.typeaheadOnSelect);
        var inputFormatter = attrs.typeaheadInputFormatter ? $parse(attrs.typeaheadInputFormatter) : undefined;
        var $setModelValue = $parse(attrs.ngModel).assign;
        var parserResult = typeaheadParser.parse(attrs.typeahead);
        var popUpEl = angular.element('<typeahead-popup></typeahead-popup>');
        popUpEl.attr({
          matches: 'matches',
          active: 'activeIdx',
          select: 'select(activeIdx)',
          query: 'query',
          position: 'position'
        });
        if (angular.isDefined(attrs.typeaheadTemplateUrl)) {
          popUpEl.attr('template-url', attrs.typeaheadTemplateUrl);
        }
        var scope = originalScope.$new();
        originalScope.$on('$destroy', function () {
          scope.$destroy();
        });
        var resetMatches = function () {
          scope.matches = [];
          scope.activeIdx = -1;
        };
        var getMatchesAsync = function (inputValue) {
          var locals = { $viewValue: inputValue };
          isLoadingSetter(originalScope, true);
          $q.when(parserResult.source(scope, locals)).then(function (matches) {
            if (inputValue === modelCtrl.$viewValue) {
              if (matches.length > 0) {
                scope.activeIdx = 0;
                scope.matches.length = 0;
                for (var i = 0; i < matches.length; i++) {
                  locals[parserResult.itemName] = matches[i];
                  scope.matches.push({
                    label: parserResult.viewMapper(scope, locals),
                    model: matches[i]
                  });
                }
                scope.query = inputValue;
                scope.position = $position.position(element);
                scope.position.top = scope.position.top + element.prop('offsetHeight');
              } else {
                resetMatches();
              }
              isLoadingSetter(originalScope, false);
            }
          }, function () {
            resetMatches();
            isLoadingSetter(originalScope, false);
          });
        };
        resetMatches();
        scope.query = undefined;
        var timeoutPromise;
        modelCtrl.$parsers.unshift(function (inputValue) {
          resetMatches();
          if (inputValue && inputValue.length >= minSearch) {
            if (waitTime > 0) {
              if (timeoutPromise) {
                $timeout.cancel(timeoutPromise);
              }
              timeoutPromise = $timeout(function () {
                getMatchesAsync(inputValue);
              }, waitTime);
            } else {
              getMatchesAsync(inputValue);
            }
          }
          if (isEditable) {
            return inputValue;
          } else {
            modelCtrl.$setValidity('editable', false);
            return undefined;
          }
        });
        modelCtrl.$formatters.push(function (modelValue) {
          var candidateViewValue, emptyViewValue;
          var locals = {};
          if (inputFormatter) {
            locals['$model'] = modelValue;
            return inputFormatter(originalScope, locals);
          } else {
            locals[parserResult.itemName] = modelValue;
            candidateViewValue = parserResult.viewMapper(originalScope, locals);
            locals[parserResult.itemName] = undefined;
            emptyViewValue = parserResult.viewMapper(originalScope, locals);
            return candidateViewValue !== emptyViewValue ? candidateViewValue : modelValue;
          }
        });
        scope.select = function (activeIdx) {
          var locals = {};
          var model, item;
          locals[parserResult.itemName] = item = scope.matches[activeIdx].model;
          model = parserResult.modelMapper(originalScope, locals);
          $setModelValue(originalScope, model);
          modelCtrl.$setValidity('editable', true);
          onSelectCallback(originalScope, {
            $item: item,
            $model: model,
            $label: parserResult.viewMapper(originalScope, locals)
          });
          resetMatches();
          element[0].focus();
        };
        element.bind('keydown', function (evt) {
          if (scope.matches.length === 0 || HOT_KEYS.indexOf(evt.which) === -1) {
            return;
          }
          evt.preventDefault();
          if (evt.which === 40) {
            scope.activeIdx = (scope.activeIdx + 1) % scope.matches.length;
            scope.$digest();
          } else if (evt.which === 38) {
            scope.activeIdx = (scope.activeIdx ? scope.activeIdx : scope.matches.length) - 1;
            scope.$digest();
          } else if (evt.which === 13 || evt.which === 9) {
            scope.$apply(function () {
              scope.select(scope.activeIdx);
            });
          } else if (evt.which === 27) {
            evt.stopPropagation();
            resetMatches();
            scope.$digest();
          }
        });
        var dismissClickHandler = function (evt) {
          if (element[0] !== evt.target) {
            resetMatches();
            scope.$digest();
          }
        };
        $document.bind('click', dismissClickHandler);
        originalScope.$on('$destroy', function () {
          $document.unbind('click', dismissClickHandler);
        });
        element.after($compile(popUpEl)(scope));
      }
    };
  }
]).directive('typeaheadPopup', function () {
  return {
    restrict: 'E',
    scope: {
      matches: '=',
      query: '=',
      active: '=',
      position: '=',
      select: '&'
    },
    replace: true,
    templateUrl: 'template/typeahead/typeahead-popup.html',
    link: function (scope, element, attrs) {
      scope.templateUrl = attrs.templateUrl;
      scope.isOpen = function () {
        return scope.matches.length > 0;
      };
      scope.isActive = function (matchIdx) {
        return scope.active == matchIdx;
      };
      scope.selectActive = function (matchIdx) {
        scope.active = matchIdx;
      };
      scope.selectMatch = function (activeIdx) {
        scope.select({ activeIdx: activeIdx });
      };
    }
  };
}).directive('typeaheadMatch', [
  '$http',
  '$templateCache',
  '$compile',
  '$parse',
  function ($http, $templateCache, $compile, $parse) {
    return {
      restrict: 'E',
      scope: {
        index: '=',
        match: '=',
        query: '='
      },
      link: function (scope, element, attrs) {
        var tplUrl = $parse(attrs.templateUrl)(scope.$parent) || 'template/typeahead/typeahead-match.html';
        $http.get(tplUrl, { cache: $templateCache }).success(function (tplContent) {
          element.replaceWith($compile(tplContent.trim())(scope));
        });
      }
    };
  }
]).filter('typeaheadHighlight', function () {
  function escapeRegexp(queryToEscape) {
    return queryToEscape.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
  }
  return function (matchItem, query) {
    return query ? matchItem.replace(new RegExp(escapeRegexp(query), 'gi'), '<strong>$&</strong>') : matchItem;
  };
});
;
(function () {
  function n(n, t, e) {
    e = (e || 0) - 1;
    for (var r = n ? n.length : 0; ++e < r;)
      if (n[e] === t)
        return e;
    return -1;
  }
  function t(t, e) {
    var r = typeof e;
    if (t = t.k, 'boolean' == r || null == e)
      return t[e] ? 0 : -1;
    'number' != r && 'string' != r && (r = 'object');
    var u = 'number' == r ? e : m + e;
    return t = (t = t[r]) && t[u], 'object' == r ? t && -1 < n(t, e) ? 0 : -1 : t ? 0 : -1;
  }
  function e(n) {
    var t = this.k, e = typeof n;
    if ('boolean' == e || null == n)
      t[n] = !0;
    else {
      'number' != e && 'string' != e && (e = 'object');
      var r = 'number' == e ? n : m + n, t = t[e] || (t[e] = {});
      'object' == e ? (t[r] || (t[r] = [])).push(n) : t[r] = !0;
    }
  }
  function r(n) {
    return n.charCodeAt(0);
  }
  function u(n, t) {
    var e = n.l, r = t.l;
    if (e !== r) {
      if (e > r || typeof e == 'undefined')
        return 1;
      if (e < r || typeof r == 'undefined')
        return -1;
    }
    return n.m - t.m;
  }
  function o(n) {
    var t = -1, r = n.length, u = n[0], o = n[r - 1];
    if (u && typeof u == 'object' && o && typeof o == 'object')
      return !1;
    for (u = f(), u['false'] = u['null'] = u['true'] = u.undefined = !1, o = f(), o.b = n, o.k = u, o.push = e; ++t < r;)
      o.push(n[t]);
    return o;
  }
  function a(n) {
    return '\\' + M[n];
  }
  function i() {
    return h.pop() || [];
  }
  function f() {
    return g.pop() || {
      b: null,
      k: null,
      configurable: !1,
      l: null,
      enumerable: !1,
      'false': !1,
      m: 0,
      leading: !1,
      maxWait: 0,
      'null': !1,
      number: null,
      z: null,
      push: null,
      string: null,
      trailing: !1,
      'true': !1,
      undefined: !1,
      n: null,
      writable: !1
    };
  }
  function l(n) {
    n.length = 0, h.length < b && h.push(n);
  }
  function c(n) {
    var t = n.k;
    t && c(t), n.b = n.k = n.l = n.object = n.number = n.string = n.n = null, g.length < b && g.push(n);
  }
  function p(n, t, e) {
    t || (t = 0), typeof e == 'undefined' && (e = n ? n.length : 0);
    var r = -1;
    e = e - t || 0;
    for (var u = Array(0 > e ? 0 : e); ++r < e;)
      u[r] = n[t + r];
    return u;
  }
  function s(e) {
    function h(n) {
      if (!n || be.call(n) != q)
        return !1;
      var t = n.valueOf, e = typeof t == 'function' && (e = se(t)) && se(e);
      return e ? n == e || se(n) == e : lt(n);
    }
    function g(n, t, e) {
      if (!n || !L[typeof n])
        return n;
      t = t && typeof e == 'undefined' ? t : nt(t, e, 3);
      for (var r = -1, u = L[typeof n] && ze(n), o = u ? u.length : 0; ++r < o && (e = u[r], false !== t(n[e], e, n)););
      return n;
    }
    function b(n, t, e) {
      var r;
      if (!n || !L[typeof n])
        return n;
      t = t && typeof e == 'undefined' ? t : nt(t, e, 3);
      for (r in n)
        if (false === t(n[r], r, n))
          break;
      return n;
    }
    function M(n, t, e) {
      var r, u = n, o = u;
      if (!u)
        return o;
      for (var a = arguments, i = 0, f = typeof e == 'number' ? 2 : a.length; ++i < f;)
        if ((u = a[i]) && L[typeof u])
          for (var l = -1, c = L[typeof u] && ze(u), p = c ? c.length : 0; ++l < p;)
            r = c[l], 'undefined' == typeof o[r] && (o[r] = u[r]);
      return o;
    }
    function V(n, t, e) {
      var r, u = n, o = u;
      if (!u)
        return o;
      var a = arguments, i = 0, f = typeof e == 'number' ? 2 : a.length;
      if (3 < f && 'function' == typeof a[f - 2])
        var l = nt(a[--f - 1], a[f--], 2);
      else
        2 < f && 'function' == typeof a[f - 1] && (l = a[--f]);
      for (; ++i < f;)
        if ((u = a[i]) && L[typeof u])
          for (var c = -1, p = L[typeof u] && ze(u), s = p ? p.length : 0; ++c < s;)
            r = p[c], o[r] = l ? l(o[r], u[r]) : u[r];
      return o;
    }
    function H(n) {
      var t, e = [];
      if (!n || !L[typeof n])
        return e;
      for (t in n)
        ve.call(n, t) && e.push(t);
      return e;
    }
    function Q(n, t) {
      var e = f();
      e.value = t, we(n, '__bindData__', e), c(e);
    }
    function X(n) {
      return n && typeof n == 'object' && !Te(n) && ve.call(n, '__wrapped__') ? n : new Y(n);
    }
    function Y(n, t) {
      this.__chain__ = !!t, this.__wrapped__ = n;
    }
    function Z(n, t, e, r, u) {
      var o = n;
      if (e) {
        if (o = e(o), typeof o != 'undefined')
          return o;
        o = n;
      }
      var a = yt(o);
      if (a) {
        var f = be.call(o);
        if (!K[f])
          return o;
        var c = Te(o);
      }
      if (!a || !t)
        return a ? c ? p(o) : V({}, o) : o;
      switch (a = De[f], f) {
      case D:
      case F:
        return new a(+o);
      case z:
      case P:
        return new a(o);
      case W:
        return a(o.source, C.exec(o));
      }
      f = !r, r || (r = i()), u || (u = i());
      for (var s = r.length; s--;)
        if (r[s] == n)
          return u[s];
      return o = c ? a(o.length) : {}, c && (ve.call(n, 'index') && (o.index = n.index), ve.call(n, 'input') && (o.input = n.input)), r.push(n), u.push(o), (c ? xt : g)(n, function (n, a) {
        o[a] = Z(n, t, e, r, u);
      }), f && (l(r), l(u)), o;
    }
    function nt(n, t, e) {
      if (typeof n != 'function')
        return Mt;
      if (typeof t == 'undefined')
        return n;
      var r = n.__bindData__ || Fe.a && !n.name;
      if (typeof r == 'undefined') {
        var u = S && pe.call(n);
        Fe.a || !u || O.test(u) || (r = !0), (Fe.a || !r) && (r = !S || S.test(u), Q(n, r));
      }
      if (true !== r && r && 1 & r[1])
        return n;
      switch (e) {
      case 1:
        return function (e) {
          return n.call(t, e);
        };
      case 2:
        return function (e, r) {
          return n.call(t, e, r);
        };
      case 3:
        return function (e, r, u) {
          return n.call(t, e, r, u);
        };
      case 4:
        return function (e, r, u, o) {
          return n.call(t, e, r, u, o);
        };
      }
      return Pt(n, t);
    }
    function tt(n, t, e, r) {
      r = (r || 0) - 1;
      for (var u = n ? n.length : 0, o = []; ++r < u;) {
        var a = n[r];
        a && typeof a == 'object' && (Te(a) || pt(a)) ? ge.apply(o, t ? a : tt(a, t, e)) : e || o.push(a);
      }
      return o;
    }
    function et(n, t, e, r, u, o) {
      if (e) {
        var a = e(n, t);
        if (typeof a != 'undefined')
          return !!a;
      }
      if (n === t)
        return 0 !== n || 1 / n == 1 / t;
      if (n === n && !(n && L[typeof n] || t && L[typeof t]))
        return !1;
      if (null == n || null == t)
        return n === t;
      var f = be.call(n), c = be.call(t);
      if (f == B && (f = q), c == B && (c = q), f != c)
        return !1;
      switch (f) {
      case D:
      case F:
        return +n == +t;
      case z:
        return n != +n ? t != +t : 0 == n ? 1 / n == 1 / t : n == +t;
      case W:
      case P:
        return n == ee(t);
      }
      if (c = f == $, !c) {
        if (ve.call(n, '__wrapped__') || ve.call(t, '__wrapped__'))
          return et(n.__wrapped__ || n, t.__wrapped__ || t, e, r, u, o);
        if (f != q)
          return !1;
        var f = n.constructor, p = t.constructor;
        if (f != p && !(gt(f) && f instanceof f && gt(p) && p instanceof p))
          return !1;
      }
      for (p = !u, u || (u = i()), o || (o = i()), f = u.length; f--;)
        if (u[f] == n)
          return o[f] == t;
      var s = 0, a = !0;
      if (u.push(n), o.push(t), c) {
        if (f = n.length, s = t.length, a = s == n.length, !a && !r)
          return a;
        for (; s--;)
          if (c = f, p = t[s], r)
            for (; c-- && !(a = et(n[c], p, e, r, u, o)););
          else if (!(a = et(n[s], p, e, r, u, o)))
            break;
        return a;
      }
      return b(t, function (t, i, f) {
        return ve.call(f, i) ? (s++, a = ve.call(n, i) && et(n[i], t, e, r, u, o)) : void 0;
      }), a && !r && b(n, function (n, t, e) {
        return ve.call(e, t) ? a = -1 < --s : void 0;
      }), p && (l(u), l(o)), a;
    }
    function rt(n, t, e, r, u) {
      (Te(t) ? xt : g)(t, function (t, o) {
        var a, i, f = t, l = n[o];
        if (t && ((i = Te(t)) || h(t))) {
          for (f = r.length; f--;)
            if (a = r[f] == t) {
              l = u[f];
              break;
            }
          if (!a) {
            var c;
            e && (f = e(l, t), c = typeof f != 'undefined') && (l = f), c || (l = i ? Te(l) ? l : [] : h(l) ? l : {}), r.push(t), u.push(l), c || rt(l, t, e, r, u);
          }
        } else
          e && (f = e(l, t), typeof f == 'undefined' && (f = t)), typeof f != 'undefined' && (l = f);
        n[o] = l;
      });
    }
    function ut(e, r, u) {
      var a = -1, f = ft(), p = e ? e.length : 0, s = [], v = !r && p >= _ && f === n, h = u || v ? i() : s;
      if (v) {
        var g = o(h);
        g ? (f = t, h = g) : (v = !1, h = u ? h : (l(h), s));
      }
      for (; ++a < p;) {
        var g = e[a], y = u ? u(g, a, e) : g;
        (r ? !a || h[h.length - 1] !== y : 0 > f(h, y)) && ((u || v) && h.push(y), s.push(g));
      }
      return v ? (l(h.b), c(h)) : u && l(h), s;
    }
    function ot(n) {
      return function (t, e, r) {
        var u = {};
        e = X.createCallback(e, r, 3), r = -1;
        var o = t ? t.length : 0;
        if (typeof o == 'number')
          for (; ++r < o;) {
            var a = t[r];
            n(u, a, e(a, r, t), t);
          }
        else
          g(t, function (t, r, o) {
            n(u, t, e(t, r, o), o);
          });
        return u;
      };
    }
    function at(n, t, e, r, u, o) {
      var a = 1 & t, i = 2 & t, f = 4 & t, l = 8 & t, c = 16 & t, p = 32 & t, s = n;
      if (!i && !gt(n))
        throw new re();
      c && !e.length && (t &= -17, c = e = !1), p && !r.length && (t &= -33, p = r = !1);
      var v = n && n.__bindData__;
      if (v)
        return !a || 1 & v[1] || (v[4] = u), !a && 1 & v[1] && (t |= 8), !f || 4 & v[1] || (v[5] = o), c && ge.apply(v[2] || (v[2] = []), e), p && ge.apply(v[3] || (v[3] = []), r), v[1] |= t, at.apply(null, v);
      if (!a || i || f || p || !(Fe.fastBind || je && c))
        g = function () {
          var v = arguments, h = a ? u : this;
          return (f || c || p) && (v = Re.call(v), c && de.apply(v, e), p && ge.apply(v, r), f && v.length < o) ? (t |= 16, at(n, l ? t : -4 & t, v, null, u, o)) : (i && (n = h[s]), this instanceof g ? (h = yt(n.prototype) ? ke(n.prototype) : {}, v = n.apply(h, v), yt(v) ? v : h) : n.apply(h, v));
        };
      else {
        if (c) {
          var h = [u];
          ge.apply(h, e);
        }
        var g = c ? je.apply(n, h) : je.call(n, u);
      }
      return Q(g, Re.call(arguments)), g;
    }
    function it(n) {
      return qe[n];
    }
    function ft() {
      var t = (t = X.indexOf) === Dt ? n : t;
      return t;
    }
    function lt(n) {
      var t, e;
      return n && be.call(n) == q && (t = n.constructor, !gt(t) || t instanceof t) ? (b(n, function (n, t) {
        e = t;
      }), typeof e == 'undefined' || ve.call(n, e)) : !1;
    }
    function ct(n) {
      return We[n];
    }
    function pt(n) {
      return n && typeof n == 'object' ? be.call(n) == B : !1;
    }
    function st(n, t, e) {
      var r = ze(n), u = r.length;
      for (t = nt(t, e, 3); u-- && (e = r[u], false !== t(n[e], e, n)););
      return n;
    }
    function vt(n) {
      var t = [];
      return b(n, function (n, e) {
        gt(n) && t.push(e);
      }), t.sort();
    }
    function ht(n) {
      for (var t = -1, e = ze(n), r = e.length, u = {}; ++t < r;) {
        var o = e[t];
        u[n[o]] = o;
      }
      return u;
    }
    function gt(n) {
      return typeof n == 'function';
    }
    function yt(n) {
      return !(!n || !L[typeof n]);
    }
    function mt(n) {
      return typeof n == 'number' || be.call(n) == z;
    }
    function _t(n) {
      return typeof n == 'string' || be.call(n) == P;
    }
    function bt(n) {
      for (var t = -1, e = ze(n), r = e.length, u = Ht(r); ++t < r;)
        u[t] = n[e[t]];
      return u;
    }
    function dt(n, t, e) {
      var r = -1, u = ft(), o = n ? n.length : 0, a = !1;
      return e = (0 > e ? Ee(0, o + e) : e) || 0, Te(n) ? a = -1 < u(n, t, e) : typeof o == 'number' ? a = -1 < (_t(n) ? n.indexOf(t, e) : u(n, t, e)) : g(n, function (n) {
        return ++r < e ? void 0 : !(a = n === t);
      }), a;
    }
    function wt(n, t, e) {
      var r = !0;
      t = X.createCallback(t, e, 3), e = -1;
      var u = n ? n.length : 0;
      if (typeof u == 'number')
        for (; ++e < u && (r = !!t(n[e], e, n)););
      else
        g(n, function (n, e, u) {
          return r = !!t(n, e, u);
        });
      return r;
    }
    function jt(n, t, e) {
      var r = [];
      t = X.createCallback(t, e, 3), e = -1;
      var u = n ? n.length : 0;
      if (typeof u == 'number')
        for (; ++e < u;) {
          var o = n[e];
          t(o, e, n) && r.push(o);
        }
      else
        g(n, function (n, e, u) {
          t(n, e, u) && r.push(n);
        });
      return r;
    }
    function kt(n, t, e) {
      t = X.createCallback(t, e, 3), e = -1;
      var r = n ? n.length : 0;
      if (typeof r != 'number') {
        var u;
        return g(n, function (n, e, r) {
          return t(n, e, r) ? (u = n, !1) : void 0;
        }), u;
      }
      for (; ++e < r;) {
        var o = n[e];
        if (t(o, e, n))
          return o;
      }
    }
    function xt(n, t, e) {
      var r = -1, u = n ? n.length : 0;
      if (t = t && typeof e == 'undefined' ? t : nt(t, e, 3), typeof u == 'number')
        for (; ++r < u && false !== t(n[r], r, n););
      else
        g(n, t);
      return n;
    }
    function Ct(n, t, e) {
      var r = n ? n.length : 0;
      if (t = t && typeof e == 'undefined' ? t : nt(t, e, 3), typeof r == 'number')
        for (; r-- && false !== t(n[r], r, n););
      else {
        var u = ze(n), r = u.length;
        g(n, function (n, e, o) {
          return e = u ? u[--r] : --r, t(o[e], e, o);
        });
      }
      return n;
    }
    function Ot(n, t, e) {
      var r = -1, u = n ? n.length : 0;
      if (t = X.createCallback(t, e, 3), typeof u == 'number')
        for (var o = Ht(u); ++r < u;)
          o[r] = t(n[r], r, n);
      else
        o = [], g(n, function (n, e, u) {
          o[++r] = t(n, e, u);
        });
      return o;
    }
    function Nt(n, t, e) {
      var u = -1 / 0, o = u;
      if (!t && Te(n)) {
        e = -1;
        for (var a = n.length; ++e < a;) {
          var i = n[e];
          i > o && (o = i);
        }
      } else
        t = !t && _t(n) ? r : X.createCallback(t, e, 3), xt(n, function (n, e, r) {
          e = t(n, e, r), e > u && (u = e, o = n);
        });
      return o;
    }
    function Et(n, t) {
      var e = -1, r = n ? n.length : 0;
      if (typeof r == 'number')
        for (var u = Ht(r); ++e < r;)
          u[e] = n[e][t];
      return u || Ot(n, t);
    }
    function It(n, t, e, r) {
      if (!n)
        return e;
      var u = 3 > arguments.length;
      t = nt(t, r, 4);
      var o = -1, a = n.length;
      if (typeof a == 'number')
        for (u && (e = n[++o]); ++o < a;)
          e = t(e, n[o], o, n);
      else
        g(n, function (n, r, o) {
          e = u ? (u = !1, n) : t(e, n, r, o);
        });
      return e;
    }
    function St(n, t, e, r) {
      var u = 3 > arguments.length;
      return t = nt(t, r, 4), Ct(n, function (n, r, o) {
        e = u ? (u = !1, n) : t(e, n, r, o);
      }), e;
    }
    function At(n) {
      var t = -1, e = n ? n.length : 0, r = Ht(typeof e == 'number' ? e : 0);
      return xt(n, function (n) {
        var e = Vt(++t);
        r[t] = r[e], r[e] = n;
      }), r;
    }
    function Rt(n, t, e) {
      var r;
      t = X.createCallback(t, e, 3), e = -1;
      var u = n ? n.length : 0;
      if (typeof u == 'number')
        for (; ++e < u && !(r = t(n[e], e, n)););
      else
        g(n, function (n, e, u) {
          return !(r = t(n, e, u));
        });
      return !!r;
    }
    function Bt(e) {
      var r = -1, u = ft(), a = e ? e.length : 0, i = tt(arguments, !0, !0, 1), f = [], l = a >= _ && u === n;
      if (l) {
        var p = o(i);
        p ? (u = t, i = p) : l = !1;
      }
      for (; ++r < a;)
        p = e[r], 0 > u(i, p) && f.push(p);
      return l && c(i), f;
    }
    function $t(n, t, e) {
      var r = 0, u = n ? n.length : 0;
      if (typeof t != 'number' && null != t) {
        var o = -1;
        for (t = X.createCallback(t, e, 3); ++o < u && t(n[o], o, n);)
          r++;
      } else if (r = t, null == r || e)
        return n ? n[0] : v;
      return p(n, 0, Ie(Ee(0, r), u));
    }
    function Dt(t, e, r) {
      if (typeof r == 'number') {
        var u = t ? t.length : 0;
        r = 0 > r ? Ee(0, u + r) : r || 0;
      } else if (r)
        return r = Tt(t, e), t[r] === e ? r : -1;
      return n(t, e, r);
    }
    function Ft(n, t, e) {
      if (typeof t != 'number' && null != t) {
        var r = 0, u = -1, o = n ? n.length : 0;
        for (t = X.createCallback(t, e, 3); ++u < o && t(n[u], u, n);)
          r++;
      } else
        r = null == t || e ? 1 : Ee(0, t);
      return p(n, r);
    }
    function Tt(n, t, e, r) {
      var u = 0, o = n ? n.length : u;
      for (e = e ? X.createCallback(e, r, 1) : Mt, t = e(t); u < o;)
        r = u + o >>> 1, e(n[r]) < t ? u = r + 1 : o = r;
      return u;
    }
    function zt(n, t, e, r) {
      return typeof t != 'boolean' && null != t && (e = (r = e) && r[t] === n ? null : t, t = !1), null != e && (e = X.createCallback(e, r, 3)), ut(n, t, e);
    }
    function qt() {
      for (var n = 1 < arguments.length ? arguments : arguments[0], t = -1, e = n ? Nt(Et(n, 'length')) : 0, r = Ht(0 > e ? 0 : e); ++t < e;)
        r[t] = Et(n, t);
      return r;
    }
    function Wt(n, t) {
      for (var e = -1, r = n ? n.length : 0, u = {}; ++e < r;) {
        var o = n[e];
        t ? u[o] = t[e] : o && (u[o[0]] = o[1]);
      }
      return u;
    }
    function Pt(n, t) {
      return 2 < arguments.length ? at(n, 17, Re.call(arguments, 2), null, t) : at(n, 1, null, null, t);
    }
    function Kt(n, t, e) {
      function r() {
        c && le(c), a = c = p = v, (g || h !== t) && (s = he(), i = n.apply(l, o));
      }
      function u() {
        var e = t - (he() - f);
        0 < e ? c = me(u, e) : (a && le(a), e = p, a = c = p = v, e && (s = he(), i = n.apply(l, o)));
      }
      var o, a, i, f, l, c, p, s = 0, h = !1, g = !0;
      if (!gt(n))
        throw new re();
      if (t = Ee(0, t) || 0, true === e)
        var y = !0, g = !1;
      else
        yt(e) && (y = e.leading, h = 'maxWait' in e && (Ee(t, e.maxWait) || 0), g = 'trailing' in e ? e.trailing : g);
      return function () {
        if (o = arguments, f = he(), l = this, p = g && (c || !y), false === h)
          var e = y && !c;
        else {
          a || y || (s = f);
          var v = h - (f - s);
          0 < v ? a || (a = me(r, v)) : (a && (a = le(a)), s = f, i = n.apply(l, o));
        }
        return c || t === h || (c = me(u, t)), e && (i = n.apply(l, o)), i;
      };
    }
    function Lt(n) {
      if (!gt(n))
        throw new re();
      var t = Re.call(arguments, 1);
      return me(function () {
        n.apply(v, t);
      }, 1);
    }
    function Mt(n) {
      return n;
    }
    function Ut(n, t) {
      var e = n, r = !t || gt(e);
      t || (e = Y, t = n, n = X), xt(vt(t), function (u) {
        var o = n[u] = t[u];
        r && (e.prototype[u] = function () {
          var t = this.__wrapped__, r = [t];
          return ge.apply(r, arguments), r = o.apply(n, r), t && typeof t == 'object' && t === r ? this : new e(r);
        });
      });
    }
    function Vt(n, t) {
      null == n && null == t && (t = 1), n = +n || 0, null == t ? (t = n, n = 0) : t = +t || 0;
      var e = Ae();
      return n % 1 || t % 1 ? n + Ie(e * (t - n + parseFloat('1e-' + ((e + '').length - 1))), t) : n + ce(e * (t - n + 1));
    }
    function Gt() {
      return this.__wrapped__;
    }
    e = e ? J.defaults(U.Object(), e, J.pick(U, R)) : U;
    var Ht = e.Array, Jt = e.Boolean, Qt = e.Date, Xt = e.Function, Yt = e.Math, Zt = e.Number, ne = e.Object, te = e.RegExp, ee = e.String, re = e.TypeError, ue = [], oe = ne.prototype, ae = e._, ie = te('^' + ee(oe.valueOf).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/valueOf|for [^\]]+/g, '.+?') + '$'), fe = Yt.ceil, le = e.clearTimeout, ce = Yt.floor, pe = Xt.prototype.toString, se = ie.test(se = ne.getPrototypeOf) && se, ve = oe.hasOwnProperty, he = ie.test(he = Qt.now) && he || function () {
        return +new Qt();
      }, ge = ue.push, ye = e.setImmediate, me = e.setTimeout, _e = ue.splice, be = oe.toString, de = ue.unshift, we = function () {
        try {
          var n = {}, t = ie.test(t = ne.defineProperty) && t, e = t(n, n, n) && t;
        } catch (r) {
        }
        return e;
      }(), je = ie.test(je = be.bind) && je, ke = ie.test(ke = ne.create) && ke, xe = ie.test(xe = Ht.isArray) && xe, Ce = e.isFinite, Oe = e.isNaN, Ne = ie.test(Ne = ne.keys) && Ne, Ee = Yt.max, Ie = Yt.min, Se = e.parseInt, Ae = Yt.random, Re = ue.slice, Be = ie.test(e.attachEvent), $e = je && !/\n|true/.test(je + Be), De = {};
    De[$] = Ht, De[D] = Jt, De[F] = Qt, De[T] = Xt, De[q] = ne, De[z] = Zt, De[W] = te, De[P] = ee, Y.prototype = X.prototype;
    var Fe = X.support = {};
    Fe.fastBind = je && !$e, Fe.a = typeof Xt.name == 'string', X.templateSettings = {
      escape: /<%-([\s\S]+?)%>/g,
      evaluate: /<%([\s\S]+?)%>/g,
      interpolate: N,
      variable: '',
      imports: { _: X }
    };
    var Te = xe || function (n) {
        return n && typeof n == 'object' ? be.call(n) == $ : !1;
      }, ze = Ne ? function (n) {
        return yt(n) ? Ne(n) : [];
      } : H, qe = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#39;'
      }, We = ht(qe), Pe = te('(' + ze(We).join('|') + ')', 'g'), Ke = te('[' + ze(qe).join('') + ']', 'g'), Le = ot(function (n, t, e) {
        ve.call(n, e) ? n[e]++ : n[e] = 1;
      }), Me = ot(function (n, t, e) {
        (ve.call(n, e) ? n[e] : n[e] = []).push(t);
      }), Ue = ot(function (n, t, e) {
        n[e] = t;
      });
    $e && G && typeof ye == 'function' && (Lt = function (n) {
      if (!gt(n))
        throw new re();
      return ye.apply(e, arguments);
    });
    var Ve = 8 == Se(d + '08') ? Se : function (n, t) {
        return Se(_t(n) ? n.replace(E, '') : n, t || 0);
      };
    return X.after = function (n, t) {
      if (!gt(t))
        throw new re();
      return function () {
        return 1 > --n ? t.apply(this, arguments) : void 0;
      };
    }, X.assign = V, X.at = function (n) {
      for (var t = arguments, e = -1, r = tt(t, !0, !1, 1), t = t[2] && t[2][t[1]] === n ? 1 : r.length, u = Ht(t); ++e < t;)
        u[e] = n[r[e]];
      return u;
    }, X.bind = Pt, X.bindAll = function (n) {
      for (var t = 1 < arguments.length ? tt(arguments, !0, !1, 1) : vt(n), e = -1, r = t.length; ++e < r;) {
        var u = t[e];
        n[u] = at(n[u], 1, null, null, n);
      }
      return n;
    }, X.bindKey = function (n, t) {
      return 2 < arguments.length ? at(t, 19, Re.call(arguments, 2), null, n) : at(t, 3, null, null, n);
    }, X.chain = function (n) {
      return n = new Y(n), n.__chain__ = !0, n;
    }, X.compact = function (n) {
      for (var t = -1, e = n ? n.length : 0, r = []; ++t < e;) {
        var u = n[t];
        u && r.push(u);
      }
      return r;
    }, X.compose = function () {
      for (var n = arguments, t = n.length || 1; t--;)
        if (!gt(n[t]))
          throw new re();
      return function () {
        for (var t = arguments, e = n.length; e--;)
          t = [n[e].apply(this, t)];
        return t[0];
      };
    }, X.countBy = Le, X.createCallback = function (n, t, e) {
      var r = typeof n;
      if (null == n || 'function' == r)
        return nt(n, t, e);
      if ('object' != r)
        return function (t) {
          return t[n];
        };
      var u = ze(n), o = u[0], a = n[o];
      return 1 != u.length || a !== a || yt(a) ? function (t) {
        for (var e = u.length, r = !1; e-- && (r = et(t[u[e]], n[u[e]], null, !0)););
        return r;
      } : function (n) {
        return n = n[o], a === n && (0 !== a || 1 / a == 1 / n);
      };
    }, X.curry = function (n, t) {
      return t = typeof t == 'number' ? t : +t || n.length, at(n, 4, null, null, null, t);
    }, X.debounce = Kt, X.defaults = M, X.defer = Lt, X.delay = function (n, t) {
      if (!gt(n))
        throw new re();
      var e = Re.call(arguments, 2);
      return me(function () {
        n.apply(v, e);
      }, t);
    }, X.difference = Bt, X.filter = jt, X.flatten = function (n, t, e, r) {
      return typeof t != 'boolean' && null != t && (e = (r = e) && r[t] === n ? null : t, t = !1), null != e && (n = Ot(n, e, r)), tt(n, t);
    }, X.forEach = xt, X.forEachRight = Ct, X.forIn = b, X.forInRight = function (n, t, e) {
      var r = [];
      b(n, function (n, t) {
        r.push(t, n);
      });
      var u = r.length;
      for (t = nt(t, e, 3); u-- && false !== t(r[u--], r[u], n););
      return n;
    }, X.forOwn = g, X.forOwnRight = st, X.functions = vt, X.groupBy = Me, X.indexBy = Ue, X.initial = function (n, t, e) {
      var r = 0, u = n ? n.length : 0;
      if (typeof t != 'number' && null != t) {
        var o = u;
        for (t = X.createCallback(t, e, 3); o-- && t(n[o], o, n);)
          r++;
      } else
        r = null == t || e ? 1 : t || r;
      return p(n, 0, Ie(Ee(0, u - r), u));
    }, X.intersection = function (e) {
      for (var r = arguments, u = r.length, a = -1, f = i(), p = -1, s = ft(), v = e ? e.length : 0, h = [], g = i(); ++a < u;) {
        var y = r[a];
        f[a] = s === n && (y ? y.length : 0) >= _ && o(a ? r[a] : g);
      }
      n:
        for (; ++p < v;) {
          var m = f[0], y = e[p];
          if (0 > (m ? t(m, y) : s(g, y))) {
            for (a = u, (m || g).push(y); --a;)
              if (m = f[a], 0 > (m ? t(m, y) : s(r[a], y)))
                continue n;
            h.push(y);
          }
        }
      for (; u--;)
        (m = f[u]) && c(m);
      return l(f), l(g), h;
    }, X.invert = ht, X.invoke = function (n, t) {
      var e = Re.call(arguments, 2), r = -1, u = typeof t == 'function', o = n ? n.length : 0, a = Ht(typeof o == 'number' ? o : 0);
      return xt(n, function (n) {
        a[++r] = (u ? t : n[t]).apply(n, e);
      }), a;
    }, X.keys = ze, X.map = Ot, X.max = Nt, X.memoize = function (n, t) {
      function e() {
        var r = e.cache, u = t ? t.apply(this, arguments) : m + arguments[0];
        return ve.call(r, u) ? r[u] : r[u] = n.apply(this, arguments);
      }
      if (!gt(n))
        throw new re();
      return e.cache = {}, e;
    }, X.merge = function (n) {
      var t = arguments, e = 2;
      if (!yt(n))
        return n;
      if ('number' != typeof t[2] && (e = t.length), 3 < e && 'function' == typeof t[e - 2])
        var r = nt(t[--e - 1], t[e--], 2);
      else
        2 < e && 'function' == typeof t[e - 1] && (r = t[--e]);
      for (var t = Re.call(arguments, 1, e), u = -1, o = i(), a = i(); ++u < e;)
        rt(n, t[u], r, o, a);
      return l(o), l(a), n;
    }, X.min = function (n, t, e) {
      var u = 1 / 0, o = u;
      if (!t && Te(n)) {
        e = -1;
        for (var a = n.length; ++e < a;) {
          var i = n[e];
          i < o && (o = i);
        }
      } else
        t = !t && _t(n) ? r : X.createCallback(t, e, 3), xt(n, function (n, e, r) {
          e = t(n, e, r), e < u && (u = e, o = n);
        });
      return o;
    }, X.omit = function (n, t, e) {
      var r = ft(), u = typeof t == 'function', o = {};
      if (u)
        t = X.createCallback(t, e, 3);
      else
        var a = tt(arguments, !0, !1, 1);
      return b(n, function (n, e, i) {
        (u ? !t(n, e, i) : 0 > r(a, e)) && (o[e] = n);
      }), o;
    }, X.once = function (n) {
      var t, e;
      if (!gt(n))
        throw new re();
      return function () {
        return t ? e : (t = !0, e = n.apply(this, arguments), n = null, e);
      };
    }, X.pairs = function (n) {
      for (var t = -1, e = ze(n), r = e.length, u = Ht(r); ++t < r;) {
        var o = e[t];
        u[t] = [
          o,
          n[o]
        ];
      }
      return u;
    }, X.partial = function (n) {
      return at(n, 16, Re.call(arguments, 1));
    }, X.partialRight = function (n) {
      return at(n, 32, null, Re.call(arguments, 1));
    }, X.pick = function (n, t, e) {
      var r = {};
      if (typeof t != 'function')
        for (var u = -1, o = tt(arguments, !0, !1, 1), a = yt(n) ? o.length : 0; ++u < a;) {
          var i = o[u];
          i in n && (r[i] = n[i]);
        }
      else
        t = X.createCallback(t, e, 3), b(n, function (n, e, u) {
          t(n, e, u) && (r[e] = n);
        });
      return r;
    }, X.pluck = Et, X.pull = function (n) {
      for (var t = arguments, e = 0, r = t.length, u = n ? n.length : 0; ++e < r;)
        for (var o = -1, a = t[e]; ++o < u;)
          n[o] === a && (_e.call(n, o--, 1), u--);
      return n;
    }, X.range = function (n, t, e) {
      n = +n || 0, e = typeof e == 'number' ? e : +e || 1, null == t && (t = n, n = 0);
      var r = -1;
      t = Ee(0, fe((t - n) / (e || 1)));
      for (var u = Ht(t); ++r < t;)
        u[r] = n, n += e;
      return u;
    }, X.reject = function (n, t, e) {
      return t = X.createCallback(t, e, 3), jt(n, function (n, e, r) {
        return !t(n, e, r);
      });
    }, X.remove = function (n, t, e) {
      var r = -1, u = n ? n.length : 0, o = [];
      for (t = X.createCallback(t, e, 3); ++r < u;)
        e = n[r], t(e, r, n) && (o.push(e), _e.call(n, r--, 1), u--);
      return o;
    }, X.rest = Ft, X.shuffle = At, X.sortBy = function (n, t, e) {
      var r = -1, o = n ? n.length : 0, a = Ht(typeof o == 'number' ? o : 0);
      for (t = X.createCallback(t, e, 3), xt(n, function (n, e, u) {
          var o = a[++r] = f();
          o.l = t(n, e, u), o.m = r, o.n = n;
        }), o = a.length, a.sort(u); o--;)
        n = a[o], a[o] = n.n, c(n);
      return a;
    }, X.tap = function (n, t) {
      return t(n), n;
    }, X.throttle = function (n, t, e) {
      var r = !0, u = !0;
      if (!gt(n))
        throw new re();
      return false === e ? r = !1 : yt(e) && (r = 'leading' in e ? e.leading : r, u = 'trailing' in e ? e.trailing : u), e = f(), e.leading = r, e.maxWait = t, e.trailing = u, n = Kt(n, t, e), c(e), n;
    }, X.times = function (n, t, e) {
      n = -1 < (n = +n) ? n : 0;
      var r = -1, u = Ht(n);
      for (t = nt(t, e, 1); ++r < n;)
        u[r] = t(r);
      return u;
    }, X.toArray = function (n) {
      return n && typeof n.length == 'number' ? p(n) : bt(n);
    }, X.transform = function (n, t, e, r) {
      var u = Te(n);
      return t = nt(t, r, 4), null == e && (u ? e = [] : (r = n && n.constructor, e = yt(r && r.prototype) ? ke(r && r.prototype) : {})), (u ? xt : g)(n, function (n, r, u) {
        return t(e, n, r, u);
      }), e;
    }, X.union = function () {
      return ut(tt(arguments, !0, !0));
    }, X.uniq = zt, X.values = bt, X.where = jt, X.without = function (n) {
      return Bt(n, Re.call(arguments, 1));
    }, X.wrap = function (n, t) {
      if (!gt(t))
        throw new re();
      return function () {
        var e = [n];
        return ge.apply(e, arguments), t.apply(this, e);
      };
    }, X.zip = qt, X.zipObject = Wt, X.collect = Ot, X.drop = Ft, X.each = xt, X.c = Ct, X.extend = V, X.methods = vt, X.object = Wt, X.select = jt, X.tail = Ft, X.unique = zt, X.unzip = qt, Ut(X), X.clone = function (n, t, e, r) {
      return typeof t != 'boolean' && null != t && (r = e, e = t, t = !1), Z(n, t, typeof e == 'function' && nt(e, r, 1));
    }, X.cloneDeep = function (n, t, e) {
      return Z(n, !0, typeof t == 'function' && nt(t, e, 1));
    }, X.contains = dt, X.escape = function (n) {
      return null == n ? '' : ee(n).replace(Ke, it);
    }, X.every = wt, X.find = kt, X.findIndex = function (n, t, e) {
      var r = -1, u = n ? n.length : 0;
      for (t = X.createCallback(t, e, 3); ++r < u;)
        if (t(n[r], r, n))
          return r;
      return -1;
    }, X.findKey = function (n, t, e) {
      var r;
      return t = X.createCallback(t, e, 3), g(n, function (n, e, u) {
        return t(n, e, u) ? (r = e, !1) : void 0;
      }), r;
    }, X.findLast = function (n, t, e) {
      var r;
      return t = X.createCallback(t, e, 3), Ct(n, function (n, e, u) {
        return t(n, e, u) ? (r = n, !1) : void 0;
      }), r;
    }, X.findLastIndex = function (n, t, e) {
      var r = n ? n.length : 0;
      for (t = X.createCallback(t, e, 3); r--;)
        if (t(n[r], r, n))
          return r;
      return -1;
    }, X.findLastKey = function (n, t, e) {
      var r;
      return t = X.createCallback(t, e, 3), st(n, function (n, e, u) {
        return t(n, e, u) ? (r = e, !1) : void 0;
      }), r;
    }, X.has = function (n, t) {
      return n ? ve.call(n, t) : !1;
    }, X.identity = Mt, X.indexOf = Dt, X.isArguments = pt, X.isArray = Te, X.isBoolean = function (n) {
      return true === n || false === n || be.call(n) == D;
    }, X.isDate = function (n) {
      return n ? typeof n == 'object' && be.call(n) == F : !1;
    }, X.isElement = function (n) {
      return n ? 1 === n.nodeType : !1;
    }, X.isEmpty = function (n) {
      var t = !0;
      if (!n)
        return t;
      var e = be.call(n), r = n.length;
      return e == $ || e == P || e == B || e == q && typeof r == 'number' && gt(n.splice) ? !r : (g(n, function () {
        return t = !1;
      }), t);
    }, X.isEqual = function (n, t, e, r) {
      return et(n, t, typeof e == 'function' && nt(e, r, 2));
    }, X.isFinite = function (n) {
      return Ce(n) && !Oe(parseFloat(n));
    }, X.isFunction = gt, X.isNaN = function (n) {
      return mt(n) && n != +n;
    }, X.isNull = function (n) {
      return null === n;
    }, X.isNumber = mt, X.isObject = yt, X.isPlainObject = h, X.isRegExp = function (n) {
      return n ? typeof n == 'object' && be.call(n) == W : !1;
    }, X.isString = _t, X.isUndefined = function (n) {
      return typeof n == 'undefined';
    }, X.lastIndexOf = function (n, t, e) {
      var r = n ? n.length : 0;
      for (typeof e == 'number' && (r = (0 > e ? Ee(0, r + e) : Ie(e, r - 1)) + 1); r--;)
        if (n[r] === t)
          return r;
      return -1;
    }, X.mixin = Ut, X.noConflict = function () {
      return e._ = ae, this;
    }, X.parseInt = Ve, X.random = Vt, X.reduce = It, X.reduceRight = St, X.result = function (n, t) {
      if (n) {
        var e = n[t];
        return gt(e) ? n[t]() : e;
      }
    }, X.runInContext = s, X.size = function (n) {
      var t = n ? n.length : 0;
      return typeof t == 'number' ? t : ze(n).length;
    }, X.some = Rt, X.sortedIndex = Tt, X.template = function (n, t, e) {
      var r = X.templateSettings;
      n || (n = ''), e = M({}, e, r);
      var u, o = M({}, e.imports, r.imports), r = ze(o), o = bt(o), i = 0, f = e.interpolate || I, l = '__p+=\'', f = te((e.escape || I).source + '|' + f.source + '|' + (f === N ? x : I).source + '|' + (e.evaluate || I).source + '|$', 'g');
      n.replace(f, function (t, e, r, o, f, c) {
        return r || (r = o), l += n.slice(i, c).replace(A, a), e && (l += '\'+__e(' + e + ')+\''), f && (u = !0, l += '\';' + f + ';__p+=\''), r && (l += '\'+((__t=(' + r + '))==null?\'\':__t)+\''), i = c + t.length, t;
      }), l += '\';\n', f = e = e.variable, f || (e = 'obj', l = 'with(' + e + '){' + l + '}'), l = (u ? l.replace(w, '') : l).replace(j, '$1').replace(k, '$1;'), l = 'function(' + e + '){' + (f ? '' : e + '||(' + e + '={});') + 'var __t,__p=\'\',__e=_.escape' + (u ? ',__j=Array.prototype.join;function print(){__p+=__j.call(arguments,\'\')}' : ';') + l + 'return __p}';
      try {
        var c = Xt(r, 'return ' + l).apply(v, o);
      } catch (p) {
        throw p.source = l, p;
      }
      return t ? c(t) : (c.source = l, c);
    }, X.unescape = function (n) {
      return null == n ? '' : ee(n).replace(Pe, ct);
    }, X.uniqueId = function (n) {
      var t = ++y;
      return ee(null == n ? '' : n) + t;
    }, X.all = wt, X.any = Rt, X.detect = kt, X.findWhere = kt, X.foldl = It, X.foldr = St, X.include = dt, X.inject = It, g(X, function (n, t) {
      X.prototype[t] || (X.prototype[t] = function () {
        var t = [this.__wrapped__], e = this.__chain__;
        return ge.apply(t, arguments), t = n.apply(X, t), e ? new Y(t, e) : t;
      });
    }), X.first = $t, X.last = function (n, t, e) {
      var r = 0, u = n ? n.length : 0;
      if (typeof t != 'number' && null != t) {
        var o = u;
        for (t = X.createCallback(t, e, 3); o-- && t(n[o], o, n);)
          r++;
      } else if (r = t, null == r || e)
        return n ? n[u - 1] : v;
      return p(n, Ee(0, u - r));
    }, X.sample = function (n, t, e) {
      var r = n ? n.length : 0;
      return typeof r != 'number' && (n = bt(n)), null == t || e ? n ? n[Vt(r - 1)] : v : (n = At(n), n.length = Ie(Ee(0, t), n.length), n);
    }, X.take = $t, X.head = $t, g(X, function (n, t) {
      var e = 'sample' !== t;
      X.prototype[t] || (X.prototype[t] = function (t, r) {
        var u = this.__chain__, o = n(this.__wrapped__, t, r);
        return u || null != t && (!r || e && typeof t == 'function') ? new Y(o, u) : o;
      });
    }), X.VERSION = '2.0.0', X.prototype.chain = function () {
      return this.__chain__ = !0, this;
    }, X.prototype.toString = function () {
      return ee(this.__wrapped__);
    }, X.prototype.value = Gt, X.prototype.valueOf = Gt, xt([
      'join',
      'pop',
      'shift'
    ], function (n) {
      var t = ue[n];
      X.prototype[n] = function () {
        var n = this.__chain__, e = t.apply(this.__wrapped__, arguments);
        return n ? new Y(e, n) : e;
      };
    }), xt([
      'push',
      'reverse',
      'sort',
      'unshift'
    ], function (n) {
      var t = ue[n];
      X.prototype[n] = function () {
        return t.apply(this.__wrapped__, arguments), this;
      };
    }), xt([
      'concat',
      'slice',
      'splice'
    ], function (n) {
      var t = ue[n];
      X.prototype[n] = function () {
        return new Y(t.apply(this.__wrapped__, arguments), this.__chain__);
      };
    }), X;
  }
  var v, h = [], g = [], y = 0, m = +new Date() + '', _ = 75, b = 40, d = ' \t\x0B\f\xa0\ufeff\n\r\u2028\u2029\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000', w = /\b__p\+='';/g, j = /\b(__p\+=)''\+/g, k = /(__e\(.*?\)|\b__t\))\+'';/g, x = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g, C = /\w*$/, O = /^function[ \n\r\t]+\w/, N = /<%=([\s\S]+?)%>/g, E = RegExp('^[' + d + ']*0+(?=.$)'), I = /($^)/, S = (S = /\bthis\b/) && S.test(s) && S, A = /['\n\r\t\u2028\u2029\\]/g, R = 'Array Boolean Date Function Math Number Object RegExp String _ attachEvent clearTimeout isFinite isNaN parseInt setImmediate setTimeout'.split(' '), B = '[object Arguments]', $ = '[object Array]', D = '[object Boolean]', F = '[object Date]', T = '[object Function]', z = '[object Number]', q = '[object Object]', W = '[object RegExp]', P = '[object String]', K = {};
  K[T] = !1, K[B] = K[$] = K[D] = K[F] = K[z] = K[q] = K[W] = K[P] = !0;
  var L = {
      'boolean': !1,
      'function': !0,
      object: !0,
      number: !1,
      string: !1,
      undefined: !1
    }, M = {
      '\\': '\\',
      '\'': '\'',
      '\n': 'n',
      '\r': 'r',
      '\t': 't',
      '\u2028': 'u2028',
      '\u2029': 'u2029'
    }, U = L[typeof window] && window || this, V = L[typeof exports] && exports, G = L[typeof module] && module && module.exports == V && module, H = L[typeof global] && global;
  !H || H.global !== H && H.window !== H || (U = H);
  var J = s();
  typeof define == 'function' && typeof define.amd == 'object' && define.amd ? (U._ = J, define(function () {
    return J;
  })) : V && !V.nodeType ? G ? (G.exports = J)._ = J : V._ = J : U._ = J;
}.call(this));
'use strict';
angular.module('iUtltimateApp').filter('percent', function () {
  return function (input) {
    return input < 1 ? (input * 100).toFixed(0) + '%' : input + '%';
  };
});
angular.module('iUtltimateApp').factory('d3', function () {
  d3 = function () {
    var d3 = { version: '3.3.6' };
    if (!Date.now)
      Date.now = function () {
        return +new Date();
      };
    var d3_arraySlice = [].slice, d3_array = function (list) {
        return d3_arraySlice.call(list);
      };
    var d3_document = document, d3_documentElement = d3_document.documentElement, d3_window = window;
    try {
      d3_array(d3_documentElement.childNodes)[0].nodeType;
    } catch (e) {
      d3_array = function (list) {
        var i = list.length, array = new Array(i);
        while (i--)
          array[i] = list[i];
        return array;
      };
    }
    try {
      d3_document.createElement('div').style.setProperty('opacity', 0, '');
    } catch (error) {
      var d3_element_prototype = d3_window.Element.prototype, d3_element_setAttribute = d3_element_prototype.setAttribute, d3_element_setAttributeNS = d3_element_prototype.setAttributeNS, d3_style_prototype = d3_window.CSSStyleDeclaration.prototype, d3_style_setProperty = d3_style_prototype.setProperty;
      d3_element_prototype.setAttribute = function (name, value) {
        d3_element_setAttribute.call(this, name, value + '');
      };
      d3_element_prototype.setAttributeNS = function (space, local, value) {
        d3_element_setAttributeNS.call(this, space, local, value + '');
      };
      d3_style_prototype.setProperty = function (name, value, priority) {
        d3_style_setProperty.call(this, name, value + '', priority);
      };
    }
    d3.ascending = function (a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    };
    d3.descending = function (a, b) {
      return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
    };
    d3.min = function (array, f) {
      var i = -1, n = array.length, a, b;
      if (arguments.length === 1) {
        while (++i < n && !((a = array[i]) != null && a <= a))
          a = undefined;
        while (++i < n)
          if ((b = array[i]) != null && a > b)
            a = b;
      } else {
        while (++i < n && !((a = f.call(array, array[i], i)) != null && a <= a))
          a = undefined;
        while (++i < n)
          if ((b = f.call(array, array[i], i)) != null && a > b)
            a = b;
      }
      return a;
    };
    d3.max = function (array, f) {
      var i = -1, n = array.length, a, b;
      if (arguments.length === 1) {
        while (++i < n && !((a = array[i]) != null && a <= a))
          a = undefined;
        while (++i < n)
          if ((b = array[i]) != null && b > a)
            a = b;
      } else {
        while (++i < n && !((a = f.call(array, array[i], i)) != null && a <= a))
          a = undefined;
        while (++i < n)
          if ((b = f.call(array, array[i], i)) != null && b > a)
            a = b;
      }
      return a;
    };
    d3.extent = function (array, f) {
      var i = -1, n = array.length, a, b, c;
      if (arguments.length === 1) {
        while (++i < n && !((a = c = array[i]) != null && a <= a))
          a = c = undefined;
        while (++i < n)
          if ((b = array[i]) != null) {
            if (a > b)
              a = b;
            if (c < b)
              c = b;
          }
      } else {
        while (++i < n && !((a = c = f.call(array, array[i], i)) != null && a <= a))
          a = undefined;
        while (++i < n)
          if ((b = f.call(array, array[i], i)) != null) {
            if (a > b)
              a = b;
            if (c < b)
              c = b;
          }
      }
      return [
        a,
        c
      ];
    };
    d3.sum = function (array, f) {
      var s = 0, n = array.length, a, i = -1;
      if (arguments.length === 1) {
        while (++i < n)
          if (!isNaN(a = +array[i]))
            s += a;
      } else {
        while (++i < n)
          if (!isNaN(a = +f.call(array, array[i], i)))
            s += a;
      }
      return s;
    };
    function d3_number(x) {
      return x != null && !isNaN(x);
    }
    d3.mean = function (array, f) {
      var n = array.length, a, m = 0, i = -1, j = 0;
      if (arguments.length === 1) {
        while (++i < n)
          if (d3_number(a = array[i]))
            m += (a - m) / ++j;
      } else {
        while (++i < n)
          if (d3_number(a = f.call(array, array[i], i)))
            m += (a - m) / ++j;
      }
      return j ? m : undefined;
    };
    d3.quantile = function (values, p) {
      var H = (values.length - 1) * p + 1, h = Math.floor(H), v = +values[h - 1], e = H - h;
      return e ? v + e * (values[h] - v) : v;
    };
    d3.median = function (array, f) {
      if (arguments.length > 1)
        array = array.map(f);
      array = array.filter(d3_number);
      return array.length ? d3.quantile(array.sort(d3.ascending), 0.5) : undefined;
    };
    d3.bisector = function (f) {
      return {
        left: function (a, x, lo, hi) {
          if (arguments.length < 3)
            lo = 0;
          if (arguments.length < 4)
            hi = a.length;
          while (lo < hi) {
            var mid = lo + hi >>> 1;
            if (f.call(a, a[mid], mid) < x)
              lo = mid + 1;
            else
              hi = mid;
          }
          return lo;
        },
        right: function (a, x, lo, hi) {
          if (arguments.length < 3)
            lo = 0;
          if (arguments.length < 4)
            hi = a.length;
          while (lo < hi) {
            var mid = lo + hi >>> 1;
            if (x < f.call(a, a[mid], mid))
              hi = mid;
            else
              lo = mid + 1;
          }
          return lo;
        }
      };
    };
    var d3_bisector = d3.bisector(function (d) {
        return d;
      });
    d3.bisectLeft = d3_bisector.left;
    d3.bisect = d3.bisectRight = d3_bisector.right;
    d3.shuffle = function (array) {
      var m = array.length, t, i;
      while (m) {
        i = Math.random() * m-- | 0;
        t = array[m], array[m] = array[i], array[i] = t;
      }
      return array;
    };
    d3.permute = function (array, indexes) {
      var i = indexes.length, permutes = new Array(i);
      while (i--)
        permutes[i] = array[indexes[i]];
      return permutes;
    };
    d3.pairs = function (array) {
      var i = 0, n = array.length - 1, p0, p1 = array[0], pairs = new Array(n < 0 ? 0 : n);
      while (i < n)
        pairs[i] = [
          p0 = p1,
          p1 = array[++i]
        ];
      return pairs;
    };
    d3.zip = function () {
      if (!(n = arguments.length))
        return [];
      for (var i = -1, m = d3.min(arguments, d3_zipLength), zips = new Array(m); ++i < m;) {
        for (var j = -1, n, zip = zips[i] = new Array(n); ++j < n;) {
          zip[j] = arguments[j][i];
        }
      }
      return zips;
    };
    function d3_zipLength(d) {
      return d.length;
    }
    d3.transpose = function (matrix) {
      return d3.zip.apply(d3, matrix);
    };
    d3.keys = function (map) {
      var keys = [];
      for (var key in map)
        keys.push(key);
      return keys;
    };
    d3.values = function (map) {
      var values = [];
      for (var key in map)
        values.push(map[key]);
      return values;
    };
    d3.entries = function (map) {
      var entries = [];
      for (var key in map)
        entries.push({
          key: key,
          value: map[key]
        });
      return entries;
    };
    d3.merge = function (arrays) {
      return Array.prototype.concat.apply([], arrays);
    };
    d3.range = function (start, stop, step) {
      if (arguments.length < 3) {
        step = 1;
        if (arguments.length < 2) {
          stop = start;
          start = 0;
        }
      }
      if ((stop - start) / step === Infinity)
        throw new Error('infinite range');
      var range = [], k = d3_range_integerScale(Math.abs(step)), i = -1, j;
      start *= k, stop *= k, step *= k;
      if (step < 0)
        while ((j = start + step * ++i) > stop)
          range.push(j / k);
      else
        while ((j = start + step * ++i) < stop)
          range.push(j / k);
      return range;
    };
    function d3_range_integerScale(x) {
      var k = 1;
      while (x * k % 1)
        k *= 10;
      return k;
    }
    function d3_class(ctor, properties) {
      try {
        for (var key in properties) {
          Object.defineProperty(ctor.prototype, key, {
            value: properties[key],
            enumerable: false
          });
        }
      } catch (e) {
        ctor.prototype = properties;
      }
    }
    d3.map = function (object) {
      var map = new d3_Map();
      if (object instanceof d3_Map)
        object.forEach(function (key, value) {
          map.set(key, value);
        });
      else
        for (var key in object)
          map.set(key, object[key]);
      return map;
    };
    function d3_Map() {
    }
    d3_class(d3_Map, {
      has: function (key) {
        return d3_map_prefix + key in this;
      },
      get: function (key) {
        return this[d3_map_prefix + key];
      },
      set: function (key, value) {
        return this[d3_map_prefix + key] = value;
      },
      remove: function (key) {
        key = d3_map_prefix + key;
        return key in this && delete this[key];
      },
      keys: function () {
        var keys = [];
        this.forEach(function (key) {
          keys.push(key);
        });
        return keys;
      },
      values: function () {
        var values = [];
        this.forEach(function (key, value) {
          values.push(value);
        });
        return values;
      },
      entries: function () {
        var entries = [];
        this.forEach(function (key, value) {
          entries.push({
            key: key,
            value: value
          });
        });
        return entries;
      },
      forEach: function (f) {
        for (var key in this) {
          if (key.charCodeAt(0) === d3_map_prefixCode) {
            f.call(this, key.substring(1), this[key]);
          }
        }
      }
    });
    var d3_map_prefix = '\0', d3_map_prefixCode = d3_map_prefix.charCodeAt(0);
    d3.nest = function () {
      var nest = {}, keys = [], sortKeys = [], sortValues, rollup;
      function map(mapType, array, depth) {
        if (depth >= keys.length)
          return rollup ? rollup.call(nest, array) : sortValues ? array.sort(sortValues) : array;
        var i = -1, n = array.length, key = keys[depth++], keyValue, object, setter, valuesByKey = new d3_Map(), values;
        while (++i < n) {
          if (values = valuesByKey.get(keyValue = key(object = array[i]))) {
            values.push(object);
          } else {
            valuesByKey.set(keyValue, [object]);
          }
        }
        if (mapType) {
          object = mapType();
          setter = function (keyValue, values) {
            object.set(keyValue, map(mapType, values, depth));
          };
        } else {
          object = {};
          setter = function (keyValue, values) {
            object[keyValue] = map(mapType, values, depth);
          };
        }
        valuesByKey.forEach(setter);
        return object;
      }
      function entries(map, depth) {
        if (depth >= keys.length)
          return map;
        var array = [], sortKey = sortKeys[depth++];
        map.forEach(function (key, keyMap) {
          array.push({
            key: key,
            values: entries(keyMap, depth)
          });
        });
        return sortKey ? array.sort(function (a, b) {
          return sortKey(a.key, b.key);
        }) : array;
      }
      nest.map = function (array, mapType) {
        return map(mapType, array, 0);
      };
      nest.entries = function (array) {
        return entries(map(d3.map, array, 0), 0);
      };
      nest.key = function (d) {
        keys.push(d);
        return nest;
      };
      nest.sortKeys = function (order) {
        sortKeys[keys.length - 1] = order;
        return nest;
      };
      nest.sortValues = function (order) {
        sortValues = order;
        return nest;
      };
      nest.rollup = function (f) {
        rollup = f;
        return nest;
      };
      return nest;
    };
    d3.set = function (array) {
      var set = new d3_Set();
      if (array)
        for (var i = 0, n = array.length; i < n; ++i)
          set.add(array[i]);
      return set;
    };
    function d3_Set() {
    }
    d3_class(d3_Set, {
      has: function (value) {
        return d3_map_prefix + value in this;
      },
      add: function (value) {
        this[d3_map_prefix + value] = true;
        return value;
      },
      remove: function (value) {
        value = d3_map_prefix + value;
        return value in this && delete this[value];
      },
      values: function () {
        var values = [];
        this.forEach(function (value) {
          values.push(value);
        });
        return values;
      },
      forEach: function (f) {
        for (var value in this) {
          if (value.charCodeAt(0) === d3_map_prefixCode) {
            f.call(this, value.substring(1));
          }
        }
      }
    });
    d3.behavior = {};
    d3.rebind = function (target, source) {
      var i = 1, n = arguments.length, method;
      while (++i < n)
        target[method = arguments[i]] = d3_rebind(target, source, source[method]);
      return target;
    };
    function d3_rebind(target, source, method) {
      return function () {
        var value = method.apply(source, arguments);
        return value === source ? target : value;
      };
    }
    function d3_vendorSymbol(object, name) {
      if (name in object)
        return name;
      name = name.charAt(0).toUpperCase() + name.substring(1);
      for (var i = 0, n = d3_vendorPrefixes.length; i < n; ++i) {
        var prefixName = d3_vendorPrefixes[i] + name;
        if (prefixName in object)
          return prefixName;
      }
    }
    var d3_vendorPrefixes = [
        'webkit',
        'ms',
        'moz',
        'Moz',
        'o',
        'O'
      ];
    function d3_noop() {
    }
    d3.dispatch = function () {
      var dispatch = new d3_dispatch(), i = -1, n = arguments.length;
      while (++i < n)
        dispatch[arguments[i]] = d3_dispatch_event(dispatch);
      return dispatch;
    };
    function d3_dispatch() {
    }
    d3_dispatch.prototype.on = function (type, listener) {
      var i = type.indexOf('.'), name = '';
      if (i >= 0) {
        name = type.substring(i + 1);
        type = type.substring(0, i);
      }
      if (type)
        return arguments.length < 2 ? this[type].on(name) : this[type].on(name, listener);
      if (arguments.length === 2) {
        if (listener == null)
          for (type in this) {
            if (this.hasOwnProperty(type))
              this[type].on(name, null);
          }
        return this;
      }
    };
    function d3_dispatch_event(dispatch) {
      var listeners = [], listenerByName = new d3_Map();
      function event() {
        var z = listeners, i = -1, n = z.length, l;
        while (++i < n)
          if (l = z[i].on)
            l.apply(this, arguments);
        return dispatch;
      }
      event.on = function (name, listener) {
        var l = listenerByName.get(name), i;
        if (arguments.length < 2)
          return l && l.on;
        if (l) {
          l.on = null;
          listeners = listeners.slice(0, i = listeners.indexOf(l)).concat(listeners.slice(i + 1));
          listenerByName.remove(name);
        }
        if (listener)
          listeners.push(listenerByName.set(name, { on: listener }));
        return dispatch;
      };
      return event;
    }
    d3.event = null;
    function d3_eventPreventDefault() {
      d3.event.preventDefault();
    }
    function d3_eventSource() {
      var e = d3.event, s;
      while (s = e.sourceEvent)
        e = s;
      return e;
    }
    function d3_eventDispatch(target) {
      var dispatch = new d3_dispatch(), i = 0, n = arguments.length;
      while (++i < n)
        dispatch[arguments[i]] = d3_dispatch_event(dispatch);
      dispatch.of = function (thiz, argumentz) {
        return function (e1) {
          try {
            var e0 = e1.sourceEvent = d3.event;
            e1.target = target;
            d3.event = e1;
            dispatch[e1.type].apply(thiz, argumentz);
          } finally {
            d3.event = e0;
          }
        };
      };
      return dispatch;
    }
    d3.requote = function (s) {
      return s.replace(d3_requote_re, '\\$&');
    };
    var d3_requote_re = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;
    var d3_subclass = {}.__proto__ ? function (object, prototype) {
        object.__proto__ = prototype;
      } : function (object, prototype) {
        for (var property in prototype)
          object[property] = prototype[property];
      };
    function d3_selection(groups) {
      d3_subclass(groups, d3_selectionPrototype);
      return groups;
    }
    var d3_select = function (s, n) {
        return n.querySelector(s);
      }, d3_selectAll = function (s, n) {
        return n.querySelectorAll(s);
      }, d3_selectMatcher = d3_documentElement[d3_vendorSymbol(d3_documentElement, 'matchesSelector')], d3_selectMatches = function (n, s) {
        return d3_selectMatcher.call(n, s);
      };
    if (typeof Sizzle === 'function') {
      d3_select = function (s, n) {
        return Sizzle(s, n)[0] || null;
      };
      d3_selectAll = function (s, n) {
        return Sizzle.uniqueSort(Sizzle(s, n));
      };
      d3_selectMatches = Sizzle.matchesSelector;
    }
    d3.selection = function () {
      return d3_selectionRoot;
    };
    var d3_selectionPrototype = d3.selection.prototype = [];
    d3_selectionPrototype.select = function (selector) {
      var subgroups = [], subgroup, subnode, group, node;
      selector = d3_selection_selector(selector);
      for (var j = -1, m = this.length; ++j < m;) {
        subgroups.push(subgroup = []);
        subgroup.parentNode = (group = this[j]).parentNode;
        for (var i = -1, n = group.length; ++i < n;) {
          if (node = group[i]) {
            subgroup.push(subnode = selector.call(node, node.__data__, i, j));
            if (subnode && '__data__' in node)
              subnode.__data__ = node.__data__;
          } else {
            subgroup.push(null);
          }
        }
      }
      return d3_selection(subgroups);
    };
    function d3_selection_selector(selector) {
      return typeof selector === 'function' ? selector : function () {
        return d3_select(selector, this);
      };
    }
    d3_selectionPrototype.selectAll = function (selector) {
      var subgroups = [], subgroup, node;
      selector = d3_selection_selectorAll(selector);
      for (var j = -1, m = this.length; ++j < m;) {
        for (var group = this[j], i = -1, n = group.length; ++i < n;) {
          if (node = group[i]) {
            subgroups.push(subgroup = d3_array(selector.call(node, node.__data__, i, j)));
            subgroup.parentNode = node;
          }
        }
      }
      return d3_selection(subgroups);
    };
    function d3_selection_selectorAll(selector) {
      return typeof selector === 'function' ? selector : function () {
        return d3_selectAll(selector, this);
      };
    }
    var d3_nsPrefix = {
        svg: 'http://www.w3.org/2000/svg',
        xhtml: 'http://www.w3.org/1999/xhtml',
        xlink: 'http://www.w3.org/1999/xlink',
        xml: 'http://www.w3.org/XML/1998/namespace',
        xmlns: 'http://www.w3.org/2000/xmlns/'
      };
    d3.ns = {
      prefix: d3_nsPrefix,
      qualify: function (name) {
        var i = name.indexOf(':'), prefix = name;
        if (i >= 0) {
          prefix = name.substring(0, i);
          name = name.substring(i + 1);
        }
        return d3_nsPrefix.hasOwnProperty(prefix) ? {
          space: d3_nsPrefix[prefix],
          local: name
        } : name;
      }
    };
    d3_selectionPrototype.attr = function (name, value) {
      if (arguments.length < 2) {
        if (typeof name === 'string') {
          var node = this.node();
          name = d3.ns.qualify(name);
          return name.local ? node.getAttributeNS(name.space, name.local) : node.getAttribute(name);
        }
        for (value in name)
          this.each(d3_selection_attr(value, name[value]));
        return this;
      }
      return this.each(d3_selection_attr(name, value));
    };
    function d3_selection_attr(name, value) {
      name = d3.ns.qualify(name);
      function attrNull() {
        this.removeAttribute(name);
      }
      function attrNullNS() {
        this.removeAttributeNS(name.space, name.local);
      }
      function attrConstant() {
        this.setAttribute(name, value);
      }
      function attrConstantNS() {
        this.setAttributeNS(name.space, name.local, value);
      }
      function attrFunction() {
        var x = value.apply(this, arguments);
        if (x == null)
          this.removeAttribute(name);
        else
          this.setAttribute(name, x);
      }
      function attrFunctionNS() {
        var x = value.apply(this, arguments);
        if (x == null)
          this.removeAttributeNS(name.space, name.local);
        else
          this.setAttributeNS(name.space, name.local, x);
      }
      return value == null ? name.local ? attrNullNS : attrNull : typeof value === 'function' ? name.local ? attrFunctionNS : attrFunction : name.local ? attrConstantNS : attrConstant;
    }
    function d3_collapse(s) {
      return s.trim().replace(/\s+/g, ' ');
    }
    d3_selectionPrototype.classed = function (name, value) {
      if (arguments.length < 2) {
        if (typeof name === 'string') {
          var node = this.node(), n = (name = name.trim().split(/^|\s+/g)).length, i = -1;
          if (value = node.classList) {
            while (++i < n)
              if (!value.contains(name[i]))
                return false;
          } else {
            value = node.getAttribute('class');
            while (++i < n)
              if (!d3_selection_classedRe(name[i]).test(value))
                return false;
          }
          return true;
        }
        for (value in name)
          this.each(d3_selection_classed(value, name[value]));
        return this;
      }
      return this.each(d3_selection_classed(name, value));
    };
    function d3_selection_classedRe(name) {
      return new RegExp('(?:^|\\s+)' + d3.requote(name) + '(?:\\s+|$)', 'g');
    }
    function d3_selection_classed(name, value) {
      name = name.trim().split(/\s+/).map(d3_selection_classedName);
      var n = name.length;
      function classedConstant() {
        var i = -1;
        while (++i < n)
          name[i](this, value);
      }
      function classedFunction() {
        var i = -1, x = value.apply(this, arguments);
        while (++i < n)
          name[i](this, x);
      }
      return typeof value === 'function' ? classedFunction : classedConstant;
    }
    function d3_selection_classedName(name) {
      var re = d3_selection_classedRe(name);
      return function (node, value) {
        if (c = node.classList)
          return value ? c.add(name) : c.remove(name);
        var c = node.getAttribute('class') || '';
        if (value) {
          re.lastIndex = 0;
          if (!re.test(c))
            node.setAttribute('class', d3_collapse(c + ' ' + name));
        } else {
          node.setAttribute('class', d3_collapse(c.replace(re, ' ')));
        }
      };
    }
    d3_selectionPrototype.style = function (name, value, priority) {
      var n = arguments.length;
      if (n < 3) {
        if (typeof name !== 'string') {
          if (n < 2)
            value = '';
          for (priority in name)
            this.each(d3_selection_style(priority, name[priority], value));
          return this;
        }
        if (n < 2)
          return d3_window.getComputedStyle(this.node(), null).getPropertyValue(name);
        priority = '';
      }
      return this.each(d3_selection_style(name, value, priority));
    };
    function d3_selection_style(name, value, priority) {
      function styleNull() {
        this.style.removeProperty(name);
      }
      function styleConstant() {
        this.style.setProperty(name, value, priority);
      }
      function styleFunction() {
        var x = value.apply(this, arguments);
        if (x == null)
          this.style.removeProperty(name);
        else
          this.style.setProperty(name, x, priority);
      }
      return value == null ? styleNull : typeof value === 'function' ? styleFunction : styleConstant;
    }
    d3_selectionPrototype.property = function (name, value) {
      if (arguments.length < 2) {
        if (typeof name === 'string')
          return this.node()[name];
        for (value in name)
          this.each(d3_selection_property(value, name[value]));
        return this;
      }
      return this.each(d3_selection_property(name, value));
    };
    function d3_selection_property(name, value) {
      function propertyNull() {
        delete this[name];
      }
      function propertyConstant() {
        this[name] = value;
      }
      function propertyFunction() {
        var x = value.apply(this, arguments);
        if (x == null)
          delete this[name];
        else
          this[name] = x;
      }
      return value == null ? propertyNull : typeof value === 'function' ? propertyFunction : propertyConstant;
    }
    d3_selectionPrototype.text = function (value) {
      return arguments.length ? this.each(typeof value === 'function' ? function () {
        var v = value.apply(this, arguments);
        this.textContent = v == null ? '' : v;
      } : value == null ? function () {
        this.textContent = '';
      } : function () {
        this.textContent = value;
      }) : this.node().textContent;
    };
    d3_selectionPrototype.html = function (value) {
      return arguments.length ? this.each(typeof value === 'function' ? function () {
        var v = value.apply(this, arguments);
        this.innerHTML = v == null ? '' : v;
      } : value == null ? function () {
        this.innerHTML = '';
      } : function () {
        this.innerHTML = value;
      }) : this.node().innerHTML;
    };
    d3_selectionPrototype.append = function (name) {
      name = d3_selection_creator(name);
      return this.select(function () {
        return this.appendChild(name.apply(this, arguments));
      });
    };
    function d3_selection_creator(name) {
      return typeof name === 'function' ? name : (name = d3.ns.qualify(name)).local ? function () {
        return d3_document.createElementNS(name.space, name.local);
      } : function () {
        return d3_document.createElementNS(this.namespaceURI, name);
      };
    }
    d3_selectionPrototype.insert = function (name, before) {
      name = d3_selection_creator(name);
      before = d3_selection_selector(before);
      return this.select(function () {
        return this.insertBefore(name.apply(this, arguments), before.apply(this, arguments));
      });
    };
    d3_selectionPrototype.remove = function () {
      return this.each(function () {
        var parent = this.parentNode;
        if (parent)
          parent.removeChild(this);
      });
    };
    d3_selectionPrototype.data = function (value, key) {
      var i = -1, n = this.length, group, node;
      if (!arguments.length) {
        value = new Array(n = (group = this[0]).length);
        while (++i < n) {
          if (node = group[i]) {
            value[i] = node.__data__;
          }
        }
        return value;
      }
      function bind(group, groupData) {
        var i, n = group.length, m = groupData.length, n0 = Math.min(n, m), updateNodes = new Array(m), enterNodes = new Array(m), exitNodes = new Array(n), node, nodeData;
        if (key) {
          var nodeByKeyValue = new d3_Map(), dataByKeyValue = new d3_Map(), keyValues = [], keyValue;
          for (i = -1; ++i < n;) {
            keyValue = key.call(node = group[i], node.__data__, i);
            if (nodeByKeyValue.has(keyValue)) {
              exitNodes[i] = node;
            } else {
              nodeByKeyValue.set(keyValue, node);
            }
            keyValues.push(keyValue);
          }
          for (i = -1; ++i < m;) {
            keyValue = key.call(groupData, nodeData = groupData[i], i);
            if (node = nodeByKeyValue.get(keyValue)) {
              updateNodes[i] = node;
              node.__data__ = nodeData;
            } else if (!dataByKeyValue.has(keyValue)) {
              enterNodes[i] = d3_selection_dataNode(nodeData);
            }
            dataByKeyValue.set(keyValue, nodeData);
            nodeByKeyValue.remove(keyValue);
          }
          for (i = -1; ++i < n;) {
            if (nodeByKeyValue.has(keyValues[i])) {
              exitNodes[i] = group[i];
            }
          }
        } else {
          for (i = -1; ++i < n0;) {
            node = group[i];
            nodeData = groupData[i];
            if (node) {
              node.__data__ = nodeData;
              updateNodes[i] = node;
            } else {
              enterNodes[i] = d3_selection_dataNode(nodeData);
            }
          }
          for (; i < m; ++i) {
            enterNodes[i] = d3_selection_dataNode(groupData[i]);
          }
          for (; i < n; ++i) {
            exitNodes[i] = group[i];
          }
        }
        enterNodes.update = updateNodes;
        enterNodes.parentNode = updateNodes.parentNode = exitNodes.parentNode = group.parentNode;
        enter.push(enterNodes);
        update.push(updateNodes);
        exit.push(exitNodes);
      }
      var enter = d3_selection_enter([]), update = d3_selection([]), exit = d3_selection([]);
      if (typeof value === 'function') {
        while (++i < n) {
          bind(group = this[i], value.call(group, group.parentNode.__data__, i));
        }
      } else {
        while (++i < n) {
          bind(group = this[i], value);
        }
      }
      update.enter = function () {
        return enter;
      };
      update.exit = function () {
        return exit;
      };
      return update;
    };
    function d3_selection_dataNode(data) {
      return { __data__: data };
    }
    d3_selectionPrototype.datum = function (value) {
      return arguments.length ? this.property('__data__', value) : this.property('__data__');
    };
    d3_selectionPrototype.filter = function (filter) {
      var subgroups = [], subgroup, group, node;
      if (typeof filter !== 'function')
        filter = d3_selection_filter(filter);
      for (var j = 0, m = this.length; j < m; j++) {
        subgroups.push(subgroup = []);
        subgroup.parentNode = (group = this[j]).parentNode;
        for (var i = 0, n = group.length; i < n; i++) {
          if ((node = group[i]) && filter.call(node, node.__data__, i)) {
            subgroup.push(node);
          }
        }
      }
      return d3_selection(subgroups);
    };
    function d3_selection_filter(selector) {
      return function () {
        return d3_selectMatches(this, selector);
      };
    }
    d3_selectionPrototype.order = function () {
      for (var j = -1, m = this.length; ++j < m;) {
        for (var group = this[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
          if (node = group[i]) {
            if (next && next !== node.nextSibling)
              next.parentNode.insertBefore(node, next);
            next = node;
          }
        }
      }
      return this;
    };
    d3_selectionPrototype.sort = function (comparator) {
      comparator = d3_selection_sortComparator.apply(this, arguments);
      for (var j = -1, m = this.length; ++j < m;)
        this[j].sort(comparator);
      return this.order();
    };
    function d3_selection_sortComparator(comparator) {
      if (!arguments.length)
        comparator = d3.ascending;
      return function (a, b) {
        return a && b ? comparator(a.__data__, b.__data__) : !a - !b;
      };
    }
    d3_selectionPrototype.each = function (callback) {
      return d3_selection_each(this, function (node, i, j) {
        callback.call(node, node.__data__, i, j);
      });
    };
    function d3_selection_each(groups, callback) {
      for (var j = 0, m = groups.length; j < m; j++) {
        for (var group = groups[j], i = 0, n = group.length, node; i < n; i++) {
          if (node = group[i])
            callback(node, i, j);
        }
      }
      return groups;
    }
    d3_selectionPrototype.call = function (callback) {
      var args = d3_array(arguments);
      callback.apply(args[0] = this, args);
      return this;
    };
    d3_selectionPrototype.empty = function () {
      return !this.node();
    };
    d3_selectionPrototype.node = function () {
      for (var j = 0, m = this.length; j < m; j++) {
        for (var group = this[j], i = 0, n = group.length; i < n; i++) {
          var node = group[i];
          if (node)
            return node;
        }
      }
      return null;
    };
    d3_selectionPrototype.size = function () {
      var n = 0;
      this.each(function () {
        ++n;
      });
      return n;
    };
    function d3_selection_enter(selection) {
      d3_subclass(selection, d3_selection_enterPrototype);
      return selection;
    }
    var d3_selection_enterPrototype = [];
    d3.selection.enter = d3_selection_enter;
    d3.selection.enter.prototype = d3_selection_enterPrototype;
    d3_selection_enterPrototype.append = d3_selectionPrototype.append;
    d3_selection_enterPrototype.empty = d3_selectionPrototype.empty;
    d3_selection_enterPrototype.node = d3_selectionPrototype.node;
    d3_selection_enterPrototype.call = d3_selectionPrototype.call;
    d3_selection_enterPrototype.size = d3_selectionPrototype.size;
    d3_selection_enterPrototype.select = function (selector) {
      var subgroups = [], subgroup, subnode, upgroup, group, node;
      for (var j = -1, m = this.length; ++j < m;) {
        upgroup = (group = this[j]).update;
        subgroups.push(subgroup = []);
        subgroup.parentNode = group.parentNode;
        for (var i = -1, n = group.length; ++i < n;) {
          if (node = group[i]) {
            subgroup.push(upgroup[i] = subnode = selector.call(group.parentNode, node.__data__, i, j));
            subnode.__data__ = node.__data__;
          } else {
            subgroup.push(null);
          }
        }
      }
      return d3_selection(subgroups);
    };
    d3_selection_enterPrototype.insert = function (name, before) {
      if (arguments.length < 2)
        before = d3_selection_enterInsertBefore(this);
      return d3_selectionPrototype.insert.call(this, name, before);
    };
    function d3_selection_enterInsertBefore(enter) {
      var i0, j0;
      return function (d, i, j) {
        var group = enter[j].update, n = group.length, node;
        if (j != j0)
          j0 = j, i0 = 0;
        if (i >= i0)
          i0 = i + 1;
        while (!(node = group[i0]) && ++i0 < n);
        return node;
      };
    }
    d3_selectionPrototype.transition = function () {
      var id = d3_transitionInheritId || ++d3_transitionId, subgroups = [], subgroup, node, transition = d3_transitionInherit || {
          time: Date.now(),
          ease: d3_ease_cubicInOut,
          delay: 0,
          duration: 250
        };
      for (var j = -1, m = this.length; ++j < m;) {
        subgroups.push(subgroup = []);
        for (var group = this[j], i = -1, n = group.length; ++i < n;) {
          if (node = group[i])
            d3_transitionNode(node, i, id, transition);
          subgroup.push(node);
        }
      }
      return d3_transition(subgroups, id);
    };
    d3_selectionPrototype.interrupt = function () {
      return this.each(d3_selection_interrupt);
    };
    function d3_selection_interrupt() {
      var lock = this.__transition__;
      if (lock)
        ++lock.active;
    }
    d3.select = function (node) {
      var group = [typeof node === 'string' ? d3_select(node, d3_document) : node];
      group.parentNode = d3_documentElement;
      return d3_selection([group]);
    };
    d3.selectAll = function (nodes) {
      var group = d3_array(typeof nodes === 'string' ? d3_selectAll(nodes, d3_document) : nodes);
      group.parentNode = d3_documentElement;
      return d3_selection([group]);
    };
    var d3_selectionRoot = d3.select(d3_documentElement);
    d3_selectionPrototype.on = function (type, listener, capture) {
      var n = arguments.length;
      if (n < 3) {
        if (typeof type !== 'string') {
          if (n < 2)
            listener = false;
          for (capture in type)
            this.each(d3_selection_on(capture, type[capture], listener));
          return this;
        }
        if (n < 2)
          return (n = this.node()['__on' + type]) && n._;
        capture = false;
      }
      return this.each(d3_selection_on(type, listener, capture));
    };
    function d3_selection_on(type, listener, capture) {
      var name = '__on' + type, i = type.indexOf('.'), wrap = d3_selection_onListener;
      if (i > 0)
        type = type.substring(0, i);
      var filter = d3_selection_onFilters.get(type);
      if (filter)
        type = filter, wrap = d3_selection_onFilter;
      function onRemove() {
        var l = this[name];
        if (l) {
          this.removeEventListener(type, l, l.$);
          delete this[name];
        }
      }
      function onAdd() {
        var l = wrap(listener, d3_array(arguments));
        onRemove.call(this);
        this.addEventListener(type, this[name] = l, l.$ = capture);
        l._ = listener;
      }
      function removeAll() {
        var re = new RegExp('^__on([^.]+)' + d3.requote(type) + '$'), match;
        for (var name in this) {
          if (match = name.match(re)) {
            var l = this[name];
            this.removeEventListener(match[1], l, l.$);
            delete this[name];
          }
        }
      }
      return i ? listener ? onAdd : onRemove : listener ? d3_noop : removeAll;
    }
    var d3_selection_onFilters = d3.map({
        mouseenter: 'mouseover',
        mouseleave: 'mouseout'
      });
    d3_selection_onFilters.forEach(function (k) {
      if ('on' + k in d3_document)
        d3_selection_onFilters.remove(k);
    });
    function d3_selection_onListener(listener, argumentz) {
      return function (e) {
        var o = d3.event;
        d3.event = e;
        argumentz[0] = this.__data__;
        try {
          listener.apply(this, argumentz);
        } finally {
          d3.event = o;
        }
      };
    }
    function d3_selection_onFilter(listener, argumentz) {
      var l = d3_selection_onListener(listener, argumentz);
      return function (e) {
        var target = this, related = e.relatedTarget;
        if (!related || related !== target && !(related.compareDocumentPosition(target) & 8)) {
          l.call(target, e);
        }
      };
    }
    var d3_event_dragSelect = d3_vendorSymbol(d3_documentElement.style, 'userSelect'), d3_event_dragId = 0;
    function d3_event_dragSuppress() {
      var name = '.dragsuppress-' + ++d3_event_dragId, touchmove = 'touchmove' + name, selectstart = 'selectstart' + name, dragstart = 'dragstart' + name, click = 'click' + name, w = d3.select(d3_window).on(touchmove, d3_eventPreventDefault).on(selectstart, d3_eventPreventDefault).on(dragstart, d3_eventPreventDefault), style = d3_documentElement.style, select = style[d3_event_dragSelect];
      style[d3_event_dragSelect] = 'none';
      return function (suppressClick) {
        w.on(name, null);
        style[d3_event_dragSelect] = select;
        if (suppressClick) {
          function off() {
            w.on(click, null);
          }
          w.on(click, function () {
            d3_eventPreventDefault();
            off();
          }, true);
          setTimeout(off, 0);
        }
      };
    }
    d3.mouse = function (container) {
      return d3_mousePoint(container, d3_eventSource());
    };
    var d3_mouse_bug44083 = /WebKit/.test(d3_window.navigator.userAgent) ? -1 : 0;
    function d3_mousePoint(container, e) {
      if (e.changedTouches)
        e = e.changedTouches[0];
      var svg = container.ownerSVGElement || container;
      if (svg.createSVGPoint) {
        var point = svg.createSVGPoint();
        if (d3_mouse_bug44083 < 0 && (d3_window.scrollX || d3_window.scrollY)) {
          svg = d3.select('body').append('svg').style({
            position: 'absolute',
            top: 0,
            left: 0,
            margin: 0,
            padding: 0,
            border: 'none'
          }, 'important');
          var ctm = svg[0][0].getScreenCTM();
          d3_mouse_bug44083 = !(ctm.f || ctm.e);
          svg.remove();
        }
        if (d3_mouse_bug44083)
          point.x = e.pageX, point.y = e.pageY;
        else
          point.x = e.clientX, point.y = e.clientY;
        point = point.matrixTransform(container.getScreenCTM().inverse());
        return [
          point.x,
          point.y
        ];
      }
      var rect = container.getBoundingClientRect();
      return [
        e.clientX - rect.left - container.clientLeft,
        e.clientY - rect.top - container.clientTop
      ];
    }
    d3.touches = function (container, touches) {
      if (arguments.length < 2)
        touches = d3_eventSource().touches;
      return touches ? d3_array(touches).map(function (touch) {
        var point = d3_mousePoint(container, touch);
        point.identifier = touch.identifier;
        return point;
      }) : [];
    };
    d3.behavior.drag = function () {
      var event = d3_eventDispatch(drag, 'drag', 'dragstart', 'dragend'), origin = null, mousedown = dragstart(d3_noop, d3.mouse, 'mousemove', 'mouseup'), touchstart = dragstart(touchid, touchposition, 'touchmove', 'touchend');
      function drag() {
        this.on('mousedown.drag', mousedown).on('touchstart.drag', touchstart);
      }
      function touchid() {
        return d3.event.changedTouches[0].identifier;
      }
      function touchposition(parent, id) {
        return d3.touches(parent).filter(function (p) {
          return p.identifier === id;
        })[0];
      }
      function dragstart(id, position, move, end) {
        return function () {
          var target = this, parent = target.parentNode, event_ = event.of(target, arguments), eventTarget = d3.event.target, eventId = id(), drag = eventId == null ? 'drag' : 'drag-' + eventId, origin_ = position(parent, eventId), dragged = 0, offset, w = d3.select(d3_window).on(move + '.' + drag, moved).on(end + '.' + drag, ended), dragRestore = d3_event_dragSuppress();
          if (origin) {
            offset = origin.apply(target, arguments);
            offset = [
              offset.x - origin_[0],
              offset.y - origin_[1]
            ];
          } else {
            offset = [
              0,
              0
            ];
          }
          event_({ type: 'dragstart' });
          function moved() {
            var p = position(parent, eventId), dx = p[0] - origin_[0], dy = p[1] - origin_[1];
            dragged |= dx | dy;
            origin_ = p;
            event_({
              type: 'drag',
              x: p[0] + offset[0],
              y: p[1] + offset[1],
              dx: dx,
              dy: dy
            });
          }
          function ended() {
            w.on(move + '.' + drag, null).on(end + '.' + drag, null);
            dragRestore(dragged && d3.event.target === eventTarget);
            event_({ type: 'dragend' });
          }
        };
      }
      drag.origin = function (x) {
        if (!arguments.length)
          return origin;
        origin = x;
        return drag;
      };
      return d3.rebind(drag, event, 'on');
    };
    var π = Math.PI, τ = 2 * π, halfπ = π / 2, ε = 0.000001, ε2 = ε * ε, d3_radians = π / 180, d3_degrees = 180 / π;
    function d3_sgn(x) {
      return x > 0 ? 1 : x < 0 ? -1 : 0;
    }
    function d3_acos(x) {
      return x > 1 ? 0 : x < -1 ? π : Math.acos(x);
    }
    function d3_asin(x) {
      return x > 1 ? halfπ : x < -1 ? -halfπ : Math.asin(x);
    }
    function d3_sinh(x) {
      return ((x = Math.exp(x)) - 1 / x) / 2;
    }
    function d3_cosh(x) {
      return ((x = Math.exp(x)) + 1 / x) / 2;
    }
    function d3_tanh(x) {
      return ((x = Math.exp(2 * x)) - 1) / (x + 1);
    }
    function d3_haversin(x) {
      return (x = Math.sin(x / 2)) * x;
    }
    var ρ = Math.SQRT2, ρ2 = 2, ρ4 = 4;
    d3.interpolateZoom = function (p0, p1) {
      var ux0 = p0[0], uy0 = p0[1], w0 = p0[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2];
      var dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + ρ4 * d2) / (2 * w0 * ρ2 * d1), b1 = (w1 * w1 - w0 * w0 - ρ4 * d2) / (2 * w1 * ρ2 * d1), r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1), dr = r1 - r0, S = (dr || Math.log(w1 / w0)) / ρ;
      function interpolate(t) {
        var s = t * S;
        if (dr) {
          var coshr0 = d3_cosh(r0), u = w0 / (ρ2 * d1) * (coshr0 * d3_tanh(ρ * s + r0) - d3_sinh(r0));
          return [
            ux0 + u * dx,
            uy0 + u * dy,
            w0 * coshr0 / d3_cosh(ρ * s + r0)
          ];
        }
        return [
          ux0 + t * dx,
          uy0 + t * dy,
          w0 * Math.exp(ρ * s)
        ];
      }
      interpolate.duration = S * 1000;
      return interpolate;
    };
    d3.behavior.zoom = function () {
      var view = {
          x: 0,
          y: 0,
          k: 1
        }, translate0, center, size = [
          960,
          500
        ], scaleExtent = d3_behavior_zoomInfinity, mousedown = 'mousedown.zoom', mousemove = 'mousemove.zoom', mouseup = 'mouseup.zoom', mousewheelTimer, touchstart = 'touchstart.zoom', touchtime, event = d3_eventDispatch(zoom, 'zoomstart', 'zoom', 'zoomend'), x0, x1, y0, y1;
      function zoom(g) {
        g.on(mousedown, mousedowned).on(d3_behavior_zoomWheel + '.zoom', mousewheeled).on(mousemove, mousewheelreset).on('dblclick.zoom', dblclicked).on(touchstart, touchstarted);
      }
      zoom.event = function (g) {
        g.each(function () {
          var event_ = event.of(this, arguments), view1 = view;
          if (d3_transitionInheritId) {
            d3.select(this).transition().each('start.zoom', function () {
              view = this.__chart__ || {
                x: 0,
                y: 0,
                k: 1
              };
              zoomstarted(event_);
            }).tween('zoom:zoom', function () {
              var dx = size[0], dy = size[1], cx = dx / 2, cy = dy / 2, i = d3.interpolateZoom([
                  (cx - view.x) / view.k,
                  (cy - view.y) / view.k,
                  dx / view.k
                ], [
                  (cx - view1.x) / view1.k,
                  (cy - view1.y) / view1.k,
                  dx / view1.k
                ]);
              return function (t) {
                var l = i(t), k = dx / l[2];
                this.__chart__ = view = {
                  x: cx - l[0] * k,
                  y: cy - l[1] * k,
                  k: k
                };
                zoomed(event_);
              };
            }).each('end.zoom', function () {
              zoomended(event_);
            });
          } else {
            this.__chart__ = view;
            zoomstarted(event_);
            zoomed(event_);
            zoomended(event_);
          }
        });
      };
      zoom.translate = function (_) {
        if (!arguments.length)
          return [
            view.x,
            view.y
          ];
        view = {
          x: +_[0],
          y: +_[1],
          k: view.k
        };
        rescale();
        return zoom;
      };
      zoom.scale = function (_) {
        if (!arguments.length)
          return view.k;
        view = {
          x: view.x,
          y: view.y,
          k: +_
        };
        rescale();
        return zoom;
      };
      zoom.scaleExtent = function (_) {
        if (!arguments.length)
          return scaleExtent;
        scaleExtent = _ == null ? d3_behavior_zoomInfinity : [
          +_[0],
          +_[1]
        ];
        return zoom;
      };
      zoom.center = function (_) {
        if (!arguments.length)
          return center;
        center = _ && [
          +_[0],
          +_[1]
        ];
        return zoom;
      };
      zoom.size = function (_) {
        if (!arguments.length)
          return size;
        size = _ && [
          +_[0],
          +_[1]
        ];
        return zoom;
      };
      zoom.x = function (z) {
        if (!arguments.length)
          return x1;
        x1 = z;
        x0 = z.copy();
        view = {
          x: 0,
          y: 0,
          k: 1
        };
        return zoom;
      };
      zoom.y = function (z) {
        if (!arguments.length)
          return y1;
        y1 = z;
        y0 = z.copy();
        view = {
          x: 0,
          y: 0,
          k: 1
        };
        return zoom;
      };
      function location(p) {
        return [
          (p[0] - view.x) / view.k,
          (p[1] - view.y) / view.k
        ];
      }
      function point(l) {
        return [
          l[0] * view.k + view.x,
          l[1] * view.k + view.y
        ];
      }
      function scaleTo(s) {
        view.k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], s));
      }
      function translateTo(p, l) {
        l = point(l);
        view.x += p[0] - l[0];
        view.y += p[1] - l[1];
      }
      function rescale() {
        if (x1)
          x1.domain(x0.range().map(function (x) {
            return (x - view.x) / view.k;
          }).map(x0.invert));
        if (y1)
          y1.domain(y0.range().map(function (y) {
            return (y - view.y) / view.k;
          }).map(y0.invert));
      }
      function zoomstarted(event) {
        event({ type: 'zoomstart' });
      }
      function zoomed(event) {
        rescale();
        event({
          type: 'zoom',
          scale: view.k,
          translate: [
            view.x,
            view.y
          ]
        });
      }
      function zoomended(event) {
        event({ type: 'zoomend' });
      }
      function mousedowned() {
        var target = this, event_ = event.of(target, arguments), eventTarget = d3.event.target, dragged = 0, w = d3.select(d3_window).on(mousemove, moved).on(mouseup, ended), l = location(d3.mouse(target)), dragRestore = d3_event_dragSuppress();
        d3_selection_interrupt.call(target);
        zoomstarted(event_);
        function moved() {
          dragged = 1;
          translateTo(d3.mouse(target), l);
          zoomed(event_);
        }
        function ended() {
          w.on(mousemove, d3_window === target ? mousewheelreset : null).on(mouseup, null);
          dragRestore(dragged && d3.event.target === eventTarget);
          zoomended(event_);
        }
      }
      function touchstarted() {
        var target = this, event_ = event.of(target, arguments), locations0 = {}, distance0 = 0, scale0, eventId = d3.event.changedTouches[0].identifier, touchmove = 'touchmove.zoom-' + eventId, touchend = 'touchend.zoom-' + eventId, w = d3.select(d3_window).on(touchmove, moved).on(touchend, ended), t = d3.select(target).on(mousedown, null).on(touchstart, started), dragRestore = d3_event_dragSuppress();
        d3_selection_interrupt.call(target);
        started();
        zoomstarted(event_);
        function relocate() {
          var touches = d3.touches(target);
          scale0 = view.k;
          touches.forEach(function (t) {
            if (t.identifier in locations0)
              locations0[t.identifier] = location(t);
          });
          return touches;
        }
        function started() {
          var changed = d3.event.changedTouches;
          for (var i = 0, n = changed.length; i < n; ++i) {
            locations0[changed[i].identifier] = null;
          }
          var touches = relocate(), now = Date.now();
          if (touches.length === 1) {
            if (now - touchtime < 500) {
              var p = touches[0], l = locations0[p.identifier];
              scaleTo(view.k * 2);
              translateTo(p, l);
              d3_eventPreventDefault();
              zoomed(event_);
            }
            touchtime = now;
          } else if (touches.length > 1) {
            var p = touches[0], q = touches[1], dx = p[0] - q[0], dy = p[1] - q[1];
            distance0 = dx * dx + dy * dy;
          }
        }
        function moved() {
          var touches = d3.touches(target), p0, l0, p1, l1;
          for (var i = 0, n = touches.length; i < n; ++i, l1 = null) {
            p1 = touches[i];
            if (l1 = locations0[p1.identifier]) {
              if (l0)
                break;
              p0 = p1, l0 = l1;
            }
          }
          if (l1) {
            var distance1 = (distance1 = p1[0] - p0[0]) * distance1 + (distance1 = p1[1] - p0[1]) * distance1, scale1 = distance0 && Math.sqrt(distance1 / distance0);
            p0 = [
              (p0[0] + p1[0]) / 2,
              (p0[1] + p1[1]) / 2
            ];
            l0 = [
              (l0[0] + l1[0]) / 2,
              (l0[1] + l1[1]) / 2
            ];
            scaleTo(scale1 * scale0);
          }
          touchtime = null;
          translateTo(p0, l0);
          zoomed(event_);
        }
        function ended() {
          if (d3.event.touches.length) {
            var changed = d3.event.changedTouches;
            for (var i = 0, n = changed.length; i < n; ++i) {
              delete locations0[changed[i].identifier];
            }
            for (var identifier in locations0) {
              return void relocate();
            }
          }
          w.on(touchmove, null).on(touchend, null);
          t.on(mousedown, mousedowned).on(touchstart, touchstarted);
          dragRestore();
          zoomended(event_);
        }
      }
      function mousewheeled() {
        var event_ = event.of(this, arguments);
        if (mousewheelTimer)
          clearTimeout(mousewheelTimer);
        else
          d3_selection_interrupt.call(this), zoomstarted(event_);
        mousewheelTimer = setTimeout(function () {
          mousewheelTimer = null;
          zoomended(event_);
        }, 50);
        d3_eventPreventDefault();
        var point = center || d3.mouse(this);
        if (!translate0)
          translate0 = location(point);
        scaleTo(Math.pow(2, d3_behavior_zoomDelta() * 0.002) * view.k);
        translateTo(point, translate0);
        zoomed(event_);
      }
      function mousewheelreset() {
        translate0 = null;
      }
      function dblclicked() {
        var event_ = event.of(this, arguments), p = d3.mouse(this), l = location(p), k = Math.log(view.k) / Math.LN2;
        zoomstarted(event_);
        scaleTo(Math.pow(2, d3.event.shiftKey ? Math.ceil(k) - 1 : Math.floor(k) + 1));
        translateTo(p, l);
        zoomed(event_);
        zoomended(event_);
      }
      return d3.rebind(zoom, event, 'on');
    };
    var d3_behavior_zoomInfinity = [
        0,
        Infinity
      ];
    var d3_behavior_zoomDelta, d3_behavior_zoomWheel = 'onwheel' in d3_document ? (d3_behavior_zoomDelta = function () {
        return -d3.event.deltaY * (d3.event.deltaMode ? 120 : 1);
      }, 'wheel') : 'onmousewheel' in d3_document ? (d3_behavior_zoomDelta = function () {
        return d3.event.wheelDelta;
      }, 'mousewheel') : (d3_behavior_zoomDelta = function () {
        return -d3.event.detail;
      }, 'MozMousePixelScroll');
    function d3_Color() {
    }
    d3_Color.prototype.toString = function () {
      return this.rgb() + '';
    };
    d3.hsl = function (h, s, l) {
      return arguments.length === 1 ? h instanceof d3_Hsl ? d3_hsl(h.h, h.s, h.l) : d3_rgb_parse('' + h, d3_rgb_hsl, d3_hsl) : d3_hsl(+h, +s, +l);
    };
    function d3_hsl(h, s, l) {
      return new d3_Hsl(h, s, l);
    }
    function d3_Hsl(h, s, l) {
      this.h = h;
      this.s = s;
      this.l = l;
    }
    var d3_hslPrototype = d3_Hsl.prototype = new d3_Color();
    d3_hslPrototype.brighter = function (k) {
      k = Math.pow(0.7, arguments.length ? k : 1);
      return d3_hsl(this.h, this.s, this.l / k);
    };
    d3_hslPrototype.darker = function (k) {
      k = Math.pow(0.7, arguments.length ? k : 1);
      return d3_hsl(this.h, this.s, k * this.l);
    };
    d3_hslPrototype.rgb = function () {
      return d3_hsl_rgb(this.h, this.s, this.l);
    };
    function d3_hsl_rgb(h, s, l) {
      var m1, m2;
      h = isNaN(h) ? 0 : (h %= 360) < 0 ? h + 360 : h;
      s = isNaN(s) ? 0 : s < 0 ? 0 : s > 1 ? 1 : s;
      l = l < 0 ? 0 : l > 1 ? 1 : l;
      m2 = l <= 0.5 ? l * (1 + s) : l + s - l * s;
      m1 = 2 * l - m2;
      function v(h) {
        if (h > 360)
          h -= 360;
        else if (h < 0)
          h += 360;
        if (h < 60)
          return m1 + (m2 - m1) * h / 60;
        if (h < 180)
          return m2;
        if (h < 240)
          return m1 + (m2 - m1) * (240 - h) / 60;
        return m1;
      }
      function vv(h) {
        return Math.round(v(h) * 255);
      }
      return d3_rgb(vv(h + 120), vv(h), vv(h - 120));
    }
    d3.hcl = function (h, c, l) {
      return arguments.length === 1 ? h instanceof d3_Hcl ? d3_hcl(h.h, h.c, h.l) : h instanceof d3_Lab ? d3_lab_hcl(h.l, h.a, h.b) : d3_lab_hcl((h = d3_rgb_lab((h = d3.rgb(h)).r, h.g, h.b)).l, h.a, h.b) : d3_hcl(+h, +c, +l);
    };
    function d3_hcl(h, c, l) {
      return new d3_Hcl(h, c, l);
    }
    function d3_Hcl(h, c, l) {
      this.h = h;
      this.c = c;
      this.l = l;
    }
    var d3_hclPrototype = d3_Hcl.prototype = new d3_Color();
    d3_hclPrototype.brighter = function (k) {
      return d3_hcl(this.h, this.c, Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)));
    };
    d3_hclPrototype.darker = function (k) {
      return d3_hcl(this.h, this.c, Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)));
    };
    d3_hclPrototype.rgb = function () {
      return d3_hcl_lab(this.h, this.c, this.l).rgb();
    };
    function d3_hcl_lab(h, c, l) {
      if (isNaN(h))
        h = 0;
      if (isNaN(c))
        c = 0;
      return d3_lab(l, Math.cos(h *= d3_radians) * c, Math.sin(h) * c);
    }
    d3.lab = function (l, a, b) {
      return arguments.length === 1 ? l instanceof d3_Lab ? d3_lab(l.l, l.a, l.b) : l instanceof d3_Hcl ? d3_hcl_lab(l.l, l.c, l.h) : d3_rgb_lab((l = d3.rgb(l)).r, l.g, l.b) : d3_lab(+l, +a, +b);
    };
    function d3_lab(l, a, b) {
      return new d3_Lab(l, a, b);
    }
    function d3_Lab(l, a, b) {
      this.l = l;
      this.a = a;
      this.b = b;
    }
    var d3_lab_K = 18;
    var d3_lab_X = 0.95047, d3_lab_Y = 1, d3_lab_Z = 1.08883;
    var d3_labPrototype = d3_Lab.prototype = new d3_Color();
    d3_labPrototype.brighter = function (k) {
      return d3_lab(Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
    };
    d3_labPrototype.darker = function (k) {
      return d3_lab(Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
    };
    d3_labPrototype.rgb = function () {
      return d3_lab_rgb(this.l, this.a, this.b);
    };
    function d3_lab_rgb(l, a, b) {
      var y = (l + 16) / 116, x = y + a / 500, z = y - b / 200;
      x = d3_lab_xyz(x) * d3_lab_X;
      y = d3_lab_xyz(y) * d3_lab_Y;
      z = d3_lab_xyz(z) * d3_lab_Z;
      return d3_rgb(d3_xyz_rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z), d3_xyz_rgb(-0.969266 * x + 1.8760108 * y + 0.041556 * z), d3_xyz_rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z));
    }
    function d3_lab_hcl(l, a, b) {
      return l > 0 ? d3_hcl(Math.atan2(b, a) * d3_degrees, Math.sqrt(a * a + b * b), l) : d3_hcl(NaN, NaN, l);
    }
    function d3_lab_xyz(x) {
      return x > 0.206893034 ? x * x * x : (x - 4 / 29) / 7.787037;
    }
    function d3_xyz_lab(x) {
      return x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787037 * x + 4 / 29;
    }
    function d3_xyz_rgb(r) {
      return Math.round(255 * (r <= 0.00304 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - 0.055));
    }
    d3.rgb = function (r, g, b) {
      return arguments.length === 1 ? r instanceof d3_Rgb ? d3_rgb(r.r, r.g, r.b) : d3_rgb_parse('' + r, d3_rgb, d3_hsl_rgb) : d3_rgb(~~r, ~~g, ~~b);
    };
    function d3_rgbNumber(value) {
      return d3_rgb(value >> 16, value >> 8 & 255, value & 255);
    }
    function d3_rgbString(value) {
      return d3_rgbNumber(value) + '';
    }
    function d3_rgb(r, g, b) {
      return new d3_Rgb(r, g, b);
    }
    function d3_Rgb(r, g, b) {
      this.r = r;
      this.g = g;
      this.b = b;
    }
    var d3_rgbPrototype = d3_Rgb.prototype = new d3_Color();
    d3_rgbPrototype.brighter = function (k) {
      k = Math.pow(0.7, arguments.length ? k : 1);
      var r = this.r, g = this.g, b = this.b, i = 30;
      if (!r && !g && !b)
        return d3_rgb(i, i, i);
      if (r && r < i)
        r = i;
      if (g && g < i)
        g = i;
      if (b && b < i)
        b = i;
      return d3_rgb(Math.min(255, ~~(r / k)), Math.min(255, ~~(g / k)), Math.min(255, ~~(b / k)));
    };
    d3_rgbPrototype.darker = function (k) {
      k = Math.pow(0.7, arguments.length ? k : 1);
      return d3_rgb(~~(k * this.r), ~~(k * this.g), ~~(k * this.b));
    };
    d3_rgbPrototype.hsl = function () {
      return d3_rgb_hsl(this.r, this.g, this.b);
    };
    d3_rgbPrototype.toString = function () {
      return '#' + d3_rgb_hex(this.r) + d3_rgb_hex(this.g) + d3_rgb_hex(this.b);
    };
    function d3_rgb_hex(v) {
      return v < 16 ? '0' + Math.max(0, v).toString(16) : Math.min(255, v).toString(16);
    }
    function d3_rgb_parse(format, rgb, hsl) {
      var r = 0, g = 0, b = 0, m1, m2, name;
      m1 = /([a-z]+)\((.*)\)/i.exec(format);
      if (m1) {
        m2 = m1[2].split(',');
        switch (m1[1]) {
        case 'hsl': {
            return hsl(parseFloat(m2[0]), parseFloat(m2[1]) / 100, parseFloat(m2[2]) / 100);
          }
        case 'rgb': {
            return rgb(d3_rgb_parseNumber(m2[0]), d3_rgb_parseNumber(m2[1]), d3_rgb_parseNumber(m2[2]));
          }
        }
      }
      if (name = d3_rgb_names.get(format))
        return rgb(name.r, name.g, name.b);
      if (format != null && format.charAt(0) === '#') {
        if (format.length === 4) {
          r = format.charAt(1);
          r += r;
          g = format.charAt(2);
          g += g;
          b = format.charAt(3);
          b += b;
        } else if (format.length === 7) {
          r = format.substring(1, 3);
          g = format.substring(3, 5);
          b = format.substring(5, 7);
        }
        r = parseInt(r, 16);
        g = parseInt(g, 16);
        b = parseInt(b, 16);
      }
      return rgb(r, g, b);
    }
    function d3_rgb_hsl(r, g, b) {
      var min = Math.min(r /= 255, g /= 255, b /= 255), max = Math.max(r, g, b), d = max - min, h, s, l = (max + min) / 2;
      if (d) {
        s = l < 0.5 ? d / (max + min) : d / (2 - max - min);
        if (r == max)
          h = (g - b) / d + (g < b ? 6 : 0);
        else if (g == max)
          h = (b - r) / d + 2;
        else
          h = (r - g) / d + 4;
        h *= 60;
      } else {
        h = NaN;
        s = l > 0 && l < 1 ? 0 : h;
      }
      return d3_hsl(h, s, l);
    }
    function d3_rgb_lab(r, g, b) {
      r = d3_rgb_xyz(r);
      g = d3_rgb_xyz(g);
      b = d3_rgb_xyz(b);
      var x = d3_xyz_lab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / d3_lab_X), y = d3_xyz_lab((0.2126729 * r + 0.7151522 * g + 0.072175 * b) / d3_lab_Y), z = d3_xyz_lab((0.0193339 * r + 0.119192 * g + 0.9503041 * b) / d3_lab_Z);
      return d3_lab(116 * y - 16, 500 * (x - y), 200 * (y - z));
    }
    function d3_rgb_xyz(r) {
      return (r /= 255) <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    }
    function d3_rgb_parseNumber(c) {
      var f = parseFloat(c);
      return c.charAt(c.length - 1) === '%' ? Math.round(f * 2.55) : f;
    }
    var d3_rgb_names = d3.map({
        aliceblue: 15792383,
        antiquewhite: 16444375,
        aqua: 65535,
        aquamarine: 8388564,
        azure: 15794175,
        beige: 16119260,
        bisque: 16770244,
        black: 0,
        blanchedalmond: 16772045,
        blue: 255,
        blueviolet: 9055202,
        brown: 10824234,
        burlywood: 14596231,
        cadetblue: 6266528,
        chartreuse: 8388352,
        chocolate: 13789470,
        coral: 16744272,
        cornflowerblue: 6591981,
        cornsilk: 16775388,
        crimson: 14423100,
        cyan: 65535,
        darkblue: 139,
        darkcyan: 35723,
        darkgoldenrod: 12092939,
        darkgray: 11119017,
        darkgreen: 25600,
        darkgrey: 11119017,
        darkkhaki: 12433259,
        darkmagenta: 9109643,
        darkolivegreen: 5597999,
        darkorange: 16747520,
        darkorchid: 10040012,
        darkred: 9109504,
        darksalmon: 15308410,
        darkseagreen: 9419919,
        darkslateblue: 4734347,
        darkslategray: 3100495,
        darkslategrey: 3100495,
        darkturquoise: 52945,
        darkviolet: 9699539,
        deeppink: 16716947,
        deepskyblue: 49151,
        dimgray: 6908265,
        dimgrey: 6908265,
        dodgerblue: 2003199,
        firebrick: 11674146,
        floralwhite: 16775920,
        forestgreen: 2263842,
        fuchsia: 16711935,
        gainsboro: 14474460,
        ghostwhite: 16316671,
        gold: 16766720,
        goldenrod: 14329120,
        gray: 8421504,
        green: 32768,
        greenyellow: 11403055,
        grey: 8421504,
        honeydew: 15794160,
        hotpink: 16738740,
        indianred: 13458524,
        indigo: 4915330,
        ivory: 16777200,
        khaki: 15787660,
        lavender: 15132410,
        lavenderblush: 16773365,
        lawngreen: 8190976,
        lemonchiffon: 16775885,
        lightblue: 11393254,
        lightcoral: 15761536,
        lightcyan: 14745599,
        lightgoldenrodyellow: 16448210,
        lightgray: 13882323,
        lightgreen: 9498256,
        lightgrey: 13882323,
        lightpink: 16758465,
        lightsalmon: 16752762,
        lightseagreen: 2142890,
        lightskyblue: 8900346,
        lightslategray: 7833753,
        lightslategrey: 7833753,
        lightsteelblue: 11584734,
        lightyellow: 16777184,
        lime: 65280,
        limegreen: 3329330,
        linen: 16445670,
        magenta: 16711935,
        maroon: 8388608,
        mediumaquamarine: 6737322,
        mediumblue: 205,
        mediumorchid: 12211667,
        mediumpurple: 9662683,
        mediumseagreen: 3978097,
        mediumslateblue: 8087790,
        mediumspringgreen: 64154,
        mediumturquoise: 4772300,
        mediumvioletred: 13047173,
        midnightblue: 1644912,
        mintcream: 16121850,
        mistyrose: 16770273,
        moccasin: 16770229,
        navajowhite: 16768685,
        navy: 128,
        oldlace: 16643558,
        olive: 8421376,
        olivedrab: 7048739,
        orange: 16753920,
        orangered: 16729344,
        orchid: 14315734,
        palegoldenrod: 15657130,
        palegreen: 10025880,
        paleturquoise: 11529966,
        palevioletred: 14381203,
        papayawhip: 16773077,
        peachpuff: 16767673,
        peru: 13468991,
        pink: 16761035,
        plum: 14524637,
        powderblue: 11591910,
        purple: 8388736,
        red: 16711680,
        rosybrown: 12357519,
        royalblue: 4286945,
        saddlebrown: 9127187,
        salmon: 16416882,
        sandybrown: 16032864,
        seagreen: 3050327,
        seashell: 16774638,
        sienna: 10506797,
        silver: 12632256,
        skyblue: 8900331,
        slateblue: 6970061,
        slategray: 7372944,
        slategrey: 7372944,
        snow: 16775930,
        springgreen: 65407,
        steelblue: 4620980,
        tan: 13808780,
        teal: 32896,
        thistle: 14204888,
        tomato: 16737095,
        turquoise: 4251856,
        violet: 15631086,
        wheat: 16113331,
        white: 16777215,
        whitesmoke: 16119285,
        yellow: 16776960,
        yellowgreen: 10145074
      });
    d3_rgb_names.forEach(function (key, value) {
      d3_rgb_names.set(key, d3_rgbNumber(value));
    });
    function d3_functor(v) {
      return typeof v === 'function' ? v : function () {
        return v;
      };
    }
    d3.functor = d3_functor;
    function d3_identity(d) {
      return d;
    }
    d3.xhr = d3_xhrType(d3_identity);
    function d3_xhrType(response) {
      return function (url, mimeType, callback) {
        if (arguments.length === 2 && typeof mimeType === 'function')
          callback = mimeType, mimeType = null;
        return d3_xhr(url, mimeType, response, callback);
      };
    }
    function d3_xhr(url, mimeType, response, callback) {
      var xhr = {}, dispatch = d3.dispatch('beforesend', 'progress', 'load', 'error'), headers = {}, request = new XMLHttpRequest(), responseType = null;
      if (d3_window.XDomainRequest && !('withCredentials' in request) && /^(http(s)?:)?\/\//.test(url))
        request = new XDomainRequest();
      'onload' in request ? request.onload = request.onerror = respond : request.onreadystatechange = function () {
        request.readyState > 3 && respond();
      };
      function respond() {
        var status = request.status, result;
        if (!status && request.responseText || status >= 200 && status < 300 || status === 304) {
          try {
            result = response.call(xhr, request);
          } catch (e) {
            dispatch.error.call(xhr, e);
            return;
          }
          dispatch.load.call(xhr, result);
        } else {
          dispatch.error.call(xhr, request);
        }
      }
      request.onprogress = function (event) {
        var o = d3.event;
        d3.event = event;
        try {
          dispatch.progress.call(xhr, request);
        } finally {
          d3.event = o;
        }
      };
      xhr.header = function (name, value) {
        name = (name + '').toLowerCase();
        if (arguments.length < 2)
          return headers[name];
        if (value == null)
          delete headers[name];
        else
          headers[name] = value + '';
        return xhr;
      };
      xhr.mimeType = function (value) {
        if (!arguments.length)
          return mimeType;
        mimeType = value == null ? null : value + '';
        return xhr;
      };
      xhr.responseType = function (value) {
        if (!arguments.length)
          return responseType;
        responseType = value;
        return xhr;
      };
      xhr.response = function (value) {
        response = value;
        return xhr;
      };
      [
        'get',
        'post'
      ].forEach(function (method) {
        xhr[method] = function () {
          return xhr.send.apply(xhr, [method].concat(d3_array(arguments)));
        };
      });
      xhr.send = function (method, data, callback) {
        if (arguments.length === 2 && typeof data === 'function')
          callback = data, data = null;
        request.open(method, url, true);
        if (mimeType != null && !('accept' in headers))
          headers['accept'] = mimeType + ',*/*';
        if (request.setRequestHeader)
          for (var name in headers)
            request.setRequestHeader(name, headers[name]);
        if (mimeType != null && request.overrideMimeType)
          request.overrideMimeType(mimeType);
        if (responseType != null)
          request.responseType = responseType;
        if (callback != null)
          xhr.on('error', callback).on('load', function (request) {
            callback(null, request);
          });
        dispatch.beforesend.call(xhr, request);
        request.send(data == null ? null : data);
        return xhr;
      };
      xhr.abort = function () {
        request.abort();
        return xhr;
      };
      d3.rebind(xhr, dispatch, 'on');
      return callback == null ? xhr : xhr.get(d3_xhr_fixCallback(callback));
    }
    function d3_xhr_fixCallback(callback) {
      return callback.length === 1 ? function (error, request) {
        callback(error == null ? request : null);
      } : callback;
    }
    d3.dsv = function (delimiter, mimeType) {
      var reFormat = new RegExp('["' + delimiter + '\n]'), delimiterCode = delimiter.charCodeAt(0);
      function dsv(url, row, callback) {
        if (arguments.length < 3)
          callback = row, row = null;
        var xhr = d3.xhr(url, mimeType, callback);
        xhr.row = function (_) {
          return arguments.length ? xhr.response((row = _) == null ? response : typedResponse(_)) : row;
        };
        return xhr.row(row);
      }
      function response(request) {
        return dsv.parse(request.responseText);
      }
      function typedResponse(f) {
        return function (request) {
          return dsv.parse(request.responseText, f);
        };
      }
      dsv.parse = function (text, f) {
        var o;
        return dsv.parseRows(text, function (row, i) {
          if (o)
            return o(row, i - 1);
          var a = new Function('d', 'return {' + row.map(function (name, i) {
              return JSON.stringify(name) + ': d[' + i + ']';
            }).join(',') + '}');
          o = f ? function (row, i) {
            return f(a(row), i);
          } : a;
        });
      };
      dsv.parseRows = function (text, f) {
        var EOL = {}, EOF = {}, rows = [], N = text.length, I = 0, n = 0, t, eol;
        function token() {
          if (I >= N)
            return EOF;
          if (eol)
            return eol = false, EOL;
          var j = I;
          if (text.charCodeAt(j) === 34) {
            var i = j;
            while (i++ < N) {
              if (text.charCodeAt(i) === 34) {
                if (text.charCodeAt(i + 1) !== 34)
                  break;
                ++i;
              }
            }
            I = i + 2;
            var c = text.charCodeAt(i + 1);
            if (c === 13) {
              eol = true;
              if (text.charCodeAt(i + 2) === 10)
                ++I;
            } else if (c === 10) {
              eol = true;
            }
            return text.substring(j + 1, i).replace(/""/g, '"');
          }
          while (I < N) {
            var c = text.charCodeAt(I++), k = 1;
            if (c === 10)
              eol = true;
            else if (c === 13) {
              eol = true;
              if (text.charCodeAt(I) === 10)
                ++I, ++k;
            } else if (c !== delimiterCode)
              continue;
            return text.substring(j, I - k);
          }
          return text.substring(j);
        }
        while ((t = token()) !== EOF) {
          var a = [];
          while (t !== EOL && t !== EOF) {
            a.push(t);
            t = token();
          }
          if (f && !(a = f(a, n++)))
            continue;
          rows.push(a);
        }
        return rows;
      };
      dsv.format = function (rows) {
        if (Array.isArray(rows[0]))
          return dsv.formatRows(rows);
        var fieldSet = new d3_Set(), fields = [];
        rows.forEach(function (row) {
          for (var field in row) {
            if (!fieldSet.has(field)) {
              fields.push(fieldSet.add(field));
            }
          }
        });
        return [fields.map(formatValue).join(delimiter)].concat(rows.map(function (row) {
          return fields.map(function (field) {
            return formatValue(row[field]);
          }).join(delimiter);
        })).join('\n');
      };
      dsv.formatRows = function (rows) {
        return rows.map(formatRow).join('\n');
      };
      function formatRow(row) {
        return row.map(formatValue).join(delimiter);
      }
      function formatValue(text) {
        return reFormat.test(text) ? '"' + text.replace(/\"/g, '""') + '"' : text;
      }
      return dsv;
    };
    d3.csv = d3.dsv(',', 'text/csv');
    d3.tsv = d3.dsv(' ', 'text/tab-separated-values');
    var d3_timer_queueHead, d3_timer_queueTail, d3_timer_interval, d3_timer_timeout, d3_timer_active, d3_timer_frame = d3_window[d3_vendorSymbol(d3_window, 'requestAnimationFrame')] || function (callback) {
        setTimeout(callback, 17);
      };
    d3.timer = function (callback, delay, then) {
      var n = arguments.length;
      if (n < 2)
        delay = 0;
      if (n < 3)
        then = Date.now();
      var time = then + delay, timer = {
          callback: callback,
          time: time,
          next: null
        };
      if (d3_timer_queueTail)
        d3_timer_queueTail.next = timer;
      else
        d3_timer_queueHead = timer;
      d3_timer_queueTail = timer;
      if (!d3_timer_interval) {
        d3_timer_timeout = clearTimeout(d3_timer_timeout);
        d3_timer_interval = 1;
        d3_timer_frame(d3_timer_step);
      }
    };
    function d3_timer_step() {
      var now = d3_timer_mark(), delay = d3_timer_sweep() - now;
      if (delay > 24) {
        if (isFinite(delay)) {
          clearTimeout(d3_timer_timeout);
          d3_timer_timeout = setTimeout(d3_timer_step, delay);
        }
        d3_timer_interval = 0;
      } else {
        d3_timer_interval = 1;
        d3_timer_frame(d3_timer_step);
      }
    }
    d3.timer.flush = function () {
      d3_timer_mark();
      d3_timer_sweep();
    };
    function d3_timer_replace(callback, delay, then) {
      var n = arguments.length;
      if (n < 2)
        delay = 0;
      if (n < 3)
        then = Date.now();
      d3_timer_active.callback = callback;
      d3_timer_active.time = then + delay;
    }
    function d3_timer_mark() {
      var now = Date.now();
      d3_timer_active = d3_timer_queueHead;
      while (d3_timer_active) {
        if (now >= d3_timer_active.time)
          d3_timer_active.flush = d3_timer_active.callback(now - d3_timer_active.time);
        d3_timer_active = d3_timer_active.next;
      }
      return now;
    }
    function d3_timer_sweep() {
      var t0, t1 = d3_timer_queueHead, time = Infinity;
      while (t1) {
        if (t1.flush) {
          t1 = t0 ? t0.next = t1.next : d3_timer_queueHead = t1.next;
        } else {
          if (t1.time < time)
            time = t1.time;
          t1 = (t0 = t1).next;
        }
      }
      d3_timer_queueTail = t0;
      return time;
    }
    var d3_format_decimalPoint = '.', d3_format_thousandsSeparator = ',', d3_format_grouping = [
        3,
        3
      ], d3_format_currencySymbol = '$';
    var d3_formatPrefixes = [
        'y',
        'z',
        'a',
        'f',
        'p',
        'n',
        '\xb5',
        'm',
        '',
        'k',
        'M',
        'G',
        'T',
        'P',
        'E',
        'Z',
        'Y'
      ].map(d3_formatPrefix);
    d3.formatPrefix = function (value, precision) {
      var i = 0;
      if (value) {
        if (value < 0)
          value *= -1;
        if (precision)
          value = d3.round(value, d3_format_precision(value, precision));
        i = 1 + Math.floor(1e-12 + Math.log(value) / Math.LN10);
        i = Math.max(-24, Math.min(24, Math.floor((i <= 0 ? i + 1 : i - 1) / 3) * 3));
      }
      return d3_formatPrefixes[8 + i / 3];
    };
    function d3_formatPrefix(d, i) {
      var k = Math.pow(10, Math.abs(8 - i) * 3);
      return {
        scale: i > 8 ? function (d) {
          return d / k;
        } : function (d) {
          return d * k;
        },
        symbol: d
      };
    }
    d3.round = function (x, n) {
      return n ? Math.round(x * (n = Math.pow(10, n))) / n : Math.round(x);
    };
    d3.format = function (specifier) {
      var match = d3_format_re.exec(specifier), fill = match[1] || ' ', align = match[2] || '>', sign = match[3] || '', symbol = match[4] || '', zfill = match[5], width = +match[6], comma = match[7], precision = match[8], type = match[9], scale = 1, suffix = '', integer = false;
      if (precision)
        precision = +precision.substring(1);
      if (zfill || fill === '0' && align === '=') {
        zfill = fill = '0';
        align = '=';
        if (comma)
          width -= Math.floor((width - 1) / 4);
      }
      switch (type) {
      case 'n':
        comma = true;
        type = 'g';
        break;
      case '%':
        scale = 100;
        suffix = '%';
        type = 'f';
        break;
      case 'p':
        scale = 100;
        suffix = '%';
        type = 'r';
        break;
      case 'b':
      case 'o':
      case 'x':
      case 'X':
        if (symbol === '#')
          symbol = '0' + type.toLowerCase();
      case 'c':
      case 'd':
        integer = true;
        precision = 0;
        break;
      case 's':
        scale = -1;
        type = 'r';
        break;
      }
      if (symbol === '#')
        symbol = '';
      else if (symbol === '$')
        symbol = d3_format_currencySymbol;
      if (type == 'r' && !precision)
        type = 'g';
      if (precision != null) {
        if (type == 'g')
          precision = Math.max(1, Math.min(21, precision));
        else if (type == 'e' || type == 'f')
          precision = Math.max(0, Math.min(20, precision));
      }
      type = d3_format_types.get(type) || d3_format_typeDefault;
      var zcomma = zfill && comma;
      return function (value) {
        if (integer && value % 1)
          return '';
        var negative = value < 0 || value === 0 && 1 / value < 0 ? (value = -value, '-') : sign;
        if (scale < 0) {
          var prefix = d3.formatPrefix(value, precision);
          value = prefix.scale(value);
          suffix = prefix.symbol;
        } else {
          value *= scale;
        }
        value = type(value, precision);
        var i = value.lastIndexOf('.'), before = i < 0 ? value : value.substring(0, i), after = i < 0 ? '' : d3_format_decimalPoint + value.substring(i + 1);
        if (!zfill && comma)
          before = d3_format_group(before);
        var length = symbol.length + before.length + after.length + (zcomma ? 0 : negative.length), padding = length < width ? new Array(length = width - length + 1).join(fill) : '';
        if (zcomma)
          before = d3_format_group(padding + before);
        negative += symbol;
        value = before + after;
        return (align === '<' ? negative + value + padding : align === '>' ? padding + negative + value : align === '^' ? padding.substring(0, length >>= 1) + negative + value + padding.substring(length) : negative + (zcomma ? value : padding + value)) + suffix;
      };
    };
    var d3_format_re = /(?:([^{])?([<>=^]))?([+\- ])?([$#])?(0)?(\d+)?(,)?(\.-?\d+)?([a-z%])?/i;
    var d3_format_types = d3.map({
        b: function (x) {
          return x.toString(2);
        },
        c: function (x) {
          return String.fromCharCode(x);
        },
        o: function (x) {
          return x.toString(8);
        },
        x: function (x) {
          return x.toString(16);
        },
        X: function (x) {
          return x.toString(16).toUpperCase();
        },
        g: function (x, p) {
          return x.toPrecision(p);
        },
        e: function (x, p) {
          return x.toExponential(p);
        },
        f: function (x, p) {
          return x.toFixed(p);
        },
        r: function (x, p) {
          return (x = d3.round(x, d3_format_precision(x, p))).toFixed(Math.max(0, Math.min(20, d3_format_precision(x * (1 + 1e-15), p))));
        }
      });
    function d3_format_precision(x, p) {
      return p - (x ? Math.ceil(Math.log(x) / Math.LN10) : 1);
    }
    function d3_format_typeDefault(x) {
      return x + '';
    }
    var d3_format_group = d3_identity;
    if (d3_format_grouping) {
      var d3_format_groupingLength = d3_format_grouping.length;
      d3_format_group = function (value) {
        var i = value.length, t = [], j = 0, g = d3_format_grouping[0];
        while (i > 0 && g > 0) {
          t.push(value.substring(i -= g, i + g));
          g = d3_format_grouping[j = (j + 1) % d3_format_groupingLength];
        }
        return t.reverse().join(d3_format_thousandsSeparator);
      };
    }
    d3.geo = {};
    function d3_adder() {
    }
    d3_adder.prototype = {
      s: 0,
      t: 0,
      add: function (y) {
        d3_adderSum(y, this.t, d3_adderTemp);
        d3_adderSum(d3_adderTemp.s, this.s, this);
        if (this.s)
          this.t += d3_adderTemp.t;
        else
          this.s = d3_adderTemp.t;
      },
      reset: function () {
        this.s = this.t = 0;
      },
      valueOf: function () {
        return this.s;
      }
    };
    var d3_adderTemp = new d3_adder();
    function d3_adderSum(a, b, o) {
      var x = o.s = a + b, bv = x - a, av = x - bv;
      o.t = a - av + (b - bv);
    }
    d3.geo.stream = function (object, listener) {
      if (object && d3_geo_streamObjectType.hasOwnProperty(object.type)) {
        d3_geo_streamObjectType[object.type](object, listener);
      } else {
        d3_geo_streamGeometry(object, listener);
      }
    };
    function d3_geo_streamGeometry(geometry, listener) {
      if (geometry && d3_geo_streamGeometryType.hasOwnProperty(geometry.type)) {
        d3_geo_streamGeometryType[geometry.type](geometry, listener);
      }
    }
    var d3_geo_streamObjectType = {
        Feature: function (feature, listener) {
          d3_geo_streamGeometry(feature.geometry, listener);
        },
        FeatureCollection: function (object, listener) {
          var features = object.features, i = -1, n = features.length;
          while (++i < n)
            d3_geo_streamGeometry(features[i].geometry, listener);
        }
      };
    var d3_geo_streamGeometryType = {
        Sphere: function (object, listener) {
          listener.sphere();
        },
        Point: function (object, listener) {
          object = object.coordinates;
          listener.point(object[0], object[1], object[2]);
        },
        MultiPoint: function (object, listener) {
          var coordinates = object.coordinates, i = -1, n = coordinates.length;
          while (++i < n)
            object = coordinates[i], listener.point(object[0], object[1], object[2]);
        },
        LineString: function (object, listener) {
          d3_geo_streamLine(object.coordinates, listener, 0);
        },
        MultiLineString: function (object, listener) {
          var coordinates = object.coordinates, i = -1, n = coordinates.length;
          while (++i < n)
            d3_geo_streamLine(coordinates[i], listener, 0);
        },
        Polygon: function (object, listener) {
          d3_geo_streamPolygon(object.coordinates, listener);
        },
        MultiPolygon: function (object, listener) {
          var coordinates = object.coordinates, i = -1, n = coordinates.length;
          while (++i < n)
            d3_geo_streamPolygon(coordinates[i], listener);
        },
        GeometryCollection: function (object, listener) {
          var geometries = object.geometries, i = -1, n = geometries.length;
          while (++i < n)
            d3_geo_streamGeometry(geometries[i], listener);
        }
      };
    function d3_geo_streamLine(coordinates, listener, closed) {
      var i = -1, n = coordinates.length - closed, coordinate;
      listener.lineStart();
      while (++i < n)
        coordinate = coordinates[i], listener.point(coordinate[0], coordinate[1], coordinate[2]);
      listener.lineEnd();
    }
    function d3_geo_streamPolygon(coordinates, listener) {
      var i = -1, n = coordinates.length;
      listener.polygonStart();
      while (++i < n)
        d3_geo_streamLine(coordinates[i], listener, 1);
      listener.polygonEnd();
    }
    d3.geo.area = function (object) {
      d3_geo_areaSum = 0;
      d3.geo.stream(object, d3_geo_area);
      return d3_geo_areaSum;
    };
    var d3_geo_areaSum, d3_geo_areaRingSum = new d3_adder();
    var d3_geo_area = {
        sphere: function () {
          d3_geo_areaSum += 4 * π;
        },
        point: d3_noop,
        lineStart: d3_noop,
        lineEnd: d3_noop,
        polygonStart: function () {
          d3_geo_areaRingSum.reset();
          d3_geo_area.lineStart = d3_geo_areaRingStart;
        },
        polygonEnd: function () {
          var area = 2 * d3_geo_areaRingSum;
          d3_geo_areaSum += area < 0 ? 4 * π + area : area;
          d3_geo_area.lineStart = d3_geo_area.lineEnd = d3_geo_area.point = d3_noop;
        }
      };
    function d3_geo_areaRingStart() {
      var λ00, φ00, λ0, cosφ0, sinφ0;
      d3_geo_area.point = function (λ, φ) {
        d3_geo_area.point = nextPoint;
        λ0 = (λ00 = λ) * d3_radians, cosφ0 = Math.cos(φ = (φ00 = φ) * d3_radians / 2 + π / 4), sinφ0 = Math.sin(φ);
      };
      function nextPoint(λ, φ) {
        λ *= d3_radians;
        φ = φ * d3_radians / 2 + π / 4;
        var dλ = λ - λ0, cosφ = Math.cos(φ), sinφ = Math.sin(φ), k = sinφ0 * sinφ, u = cosφ0 * cosφ + k * Math.cos(dλ), v = k * Math.sin(dλ);
        d3_geo_areaRingSum.add(Math.atan2(v, u));
        λ0 = λ, cosφ0 = cosφ, sinφ0 = sinφ;
      }
      d3_geo_area.lineEnd = function () {
        nextPoint(λ00, φ00);
      };
    }
    function d3_geo_cartesian(spherical) {
      var λ = spherical[0], φ = spherical[1], cosφ = Math.cos(φ);
      return [
        cosφ * Math.cos(λ),
        cosφ * Math.sin(λ),
        Math.sin(φ)
      ];
    }
    function d3_geo_cartesianDot(a, b) {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }
    function d3_geo_cartesianCross(a, b) {
      return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
      ];
    }
    function d3_geo_cartesianAdd(a, b) {
      a[0] += b[0];
      a[1] += b[1];
      a[2] += b[2];
    }
    function d3_geo_cartesianScale(vector, k) {
      return [
        vector[0] * k,
        vector[1] * k,
        vector[2] * k
      ];
    }
    function d3_geo_cartesianNormalize(d) {
      var l = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
      d[0] /= l;
      d[1] /= l;
      d[2] /= l;
    }
    function d3_geo_spherical(cartesian) {
      return [
        Math.atan2(cartesian[1], cartesian[0]),
        d3_asin(cartesian[2])
      ];
    }
    function d3_geo_sphericalEqual(a, b) {
      return Math.abs(a[0] - b[0]) < ε && Math.abs(a[1] - b[1]) < ε;
    }
    d3.geo.bounds = function () {
      var λ0, φ0, λ1, φ1, λ_, λ__, φ__, p0, dλSum, ranges, range;
      var bound = {
          point: point,
          lineStart: lineStart,
          lineEnd: lineEnd,
          polygonStart: function () {
            bound.point = ringPoint;
            bound.lineStart = ringStart;
            bound.lineEnd = ringEnd;
            dλSum = 0;
            d3_geo_area.polygonStart();
          },
          polygonEnd: function () {
            d3_geo_area.polygonEnd();
            bound.point = point;
            bound.lineStart = lineStart;
            bound.lineEnd = lineEnd;
            if (d3_geo_areaRingSum < 0)
              λ0 = -(λ1 = 180), φ0 = -(φ1 = 90);
            else if (dλSum > ε)
              φ1 = 90;
            else if (dλSum < -ε)
              φ0 = -90;
            range[0] = λ0, range[1] = λ1;
          }
        };
      function point(λ, φ) {
        ranges.push(range = [
          λ0 = λ,
          λ1 = λ
        ]);
        if (φ < φ0)
          φ0 = φ;
        if (φ > φ1)
          φ1 = φ;
      }
      function linePoint(λ, φ) {
        var p = d3_geo_cartesian([
            λ * d3_radians,
            φ * d3_radians
          ]);
        if (p0) {
          var normal = d3_geo_cartesianCross(p0, p), equatorial = [
              normal[1],
              -normal[0],
              0
            ], inflection = d3_geo_cartesianCross(equatorial, normal);
          d3_geo_cartesianNormalize(inflection);
          inflection = d3_geo_spherical(inflection);
          var dλ = λ - λ_, s = dλ > 0 ? 1 : -1, λi = inflection[0] * d3_degrees * s, antimeridian = Math.abs(dλ) > 180;
          if (antimeridian ^ (s * λ_ < λi && λi < s * λ)) {
            var φi = inflection[1] * d3_degrees;
            if (φi > φ1)
              φ1 = φi;
          } else if (λi = (λi + 360) % 360 - 180, antimeridian ^ (s * λ_ < λi && λi < s * λ)) {
            var φi = -inflection[1] * d3_degrees;
            if (φi < φ0)
              φ0 = φi;
          } else {
            if (φ < φ0)
              φ0 = φ;
            if (φ > φ1)
              φ1 = φ;
          }
          if (antimeridian) {
            if (λ < λ_) {
              if (angle(λ0, λ) > angle(λ0, λ1))
                λ1 = λ;
            } else {
              if (angle(λ, λ1) > angle(λ0, λ1))
                λ0 = λ;
            }
          } else {
            if (λ1 >= λ0) {
              if (λ < λ0)
                λ0 = λ;
              if (λ > λ1)
                λ1 = λ;
            } else {
              if (λ > λ_) {
                if (angle(λ0, λ) > angle(λ0, λ1))
                  λ1 = λ;
              } else {
                if (angle(λ, λ1) > angle(λ0, λ1))
                  λ0 = λ;
              }
            }
          }
        } else {
          point(λ, φ);
        }
        p0 = p, λ_ = λ;
      }
      function lineStart() {
        bound.point = linePoint;
      }
      function lineEnd() {
        range[0] = λ0, range[1] = λ1;
        bound.point = point;
        p0 = null;
      }
      function ringPoint(λ, φ) {
        if (p0) {
          var dλ = λ - λ_;
          dλSum += Math.abs(dλ) > 180 ? dλ + (dλ > 0 ? 360 : -360) : dλ;
        } else
          λ__ = λ, φ__ = φ;
        d3_geo_area.point(λ, φ);
        linePoint(λ, φ);
      }
      function ringStart() {
        d3_geo_area.lineStart();
      }
      function ringEnd() {
        ringPoint(λ__, φ__);
        d3_geo_area.lineEnd();
        if (Math.abs(dλSum) > ε)
          λ0 = -(λ1 = 180);
        range[0] = λ0, range[1] = λ1;
        p0 = null;
      }
      function angle(λ0, λ1) {
        return (λ1 -= λ0) < 0 ? λ1 + 360 : λ1;
      }
      function compareRanges(a, b) {
        return a[0] - b[0];
      }
      function withinRange(x, range) {
        return range[0] <= range[1] ? range[0] <= x && x <= range[1] : x < range[0] || range[1] < x;
      }
      return function (feature) {
        φ1 = λ1 = -(λ0 = φ0 = Infinity);
        ranges = [];
        d3.geo.stream(feature, bound);
        var n = ranges.length;
        if (n) {
          ranges.sort(compareRanges);
          for (var i = 1, a = ranges[0], b, merged = [a]; i < n; ++i) {
            b = ranges[i];
            if (withinRange(b[0], a) || withinRange(b[1], a)) {
              if (angle(a[0], b[1]) > angle(a[0], a[1]))
                a[1] = b[1];
              if (angle(b[0], a[1]) > angle(a[0], a[1]))
                a[0] = b[0];
            } else {
              merged.push(a = b);
            }
          }
          var best = -Infinity, dλ;
          for (var n = merged.length - 1, i = 0, a = merged[n], b; i <= n; a = b, ++i) {
            b = merged[i];
            if ((dλ = angle(a[1], b[0])) > best)
              best = dλ, λ0 = b[0], λ1 = a[1];
          }
        }
        ranges = range = null;
        return λ0 === Infinity || φ0 === Infinity ? [
          [
            NaN,
            NaN
          ],
          [
            NaN,
            NaN
          ]
        ] : [
          [
            λ0,
            φ0
          ],
          [
            λ1,
            φ1
          ]
        ];
      };
    }();
    d3.geo.centroid = function (object) {
      d3_geo_centroidW0 = d3_geo_centroidW1 = d3_geo_centroidX0 = d3_geo_centroidY0 = d3_geo_centroidZ0 = d3_geo_centroidX1 = d3_geo_centroidY1 = d3_geo_centroidZ1 = d3_geo_centroidX2 = d3_geo_centroidY2 = d3_geo_centroidZ2 = 0;
      d3.geo.stream(object, d3_geo_centroid);
      var x = d3_geo_centroidX2, y = d3_geo_centroidY2, z = d3_geo_centroidZ2, m = x * x + y * y + z * z;
      if (m < ε2) {
        x = d3_geo_centroidX1, y = d3_geo_centroidY1, z = d3_geo_centroidZ1;
        if (d3_geo_centroidW1 < ε)
          x = d3_geo_centroidX0, y = d3_geo_centroidY0, z = d3_geo_centroidZ0;
        m = x * x + y * y + z * z;
        if (m < ε2)
          return [
            NaN,
            NaN
          ];
      }
      return [
        Math.atan2(y, x) * d3_degrees,
        d3_asin(z / Math.sqrt(m)) * d3_degrees
      ];
    };
    var d3_geo_centroidW0, d3_geo_centroidW1, d3_geo_centroidX0, d3_geo_centroidY0, d3_geo_centroidZ0, d3_geo_centroidX1, d3_geo_centroidY1, d3_geo_centroidZ1, d3_geo_centroidX2, d3_geo_centroidY2, d3_geo_centroidZ2;
    var d3_geo_centroid = {
        sphere: d3_noop,
        point: d3_geo_centroidPoint,
        lineStart: d3_geo_centroidLineStart,
        lineEnd: d3_geo_centroidLineEnd,
        polygonStart: function () {
          d3_geo_centroid.lineStart = d3_geo_centroidRingStart;
        },
        polygonEnd: function () {
          d3_geo_centroid.lineStart = d3_geo_centroidLineStart;
        }
      };
    function d3_geo_centroidPoint(λ, φ) {
      λ *= d3_radians;
      var cosφ = Math.cos(φ *= d3_radians);
      d3_geo_centroidPointXYZ(cosφ * Math.cos(λ), cosφ * Math.sin(λ), Math.sin(φ));
    }
    function d3_geo_centroidPointXYZ(x, y, z) {
      ++d3_geo_centroidW0;
      d3_geo_centroidX0 += (x - d3_geo_centroidX0) / d3_geo_centroidW0;
      d3_geo_centroidY0 += (y - d3_geo_centroidY0) / d3_geo_centroidW0;
      d3_geo_centroidZ0 += (z - d3_geo_centroidZ0) / d3_geo_centroidW0;
    }
    function d3_geo_centroidLineStart() {
      var x0, y0, z0;
      d3_geo_centroid.point = function (λ, φ) {
        λ *= d3_radians;
        var cosφ = Math.cos(φ *= d3_radians);
        x0 = cosφ * Math.cos(λ);
        y0 = cosφ * Math.sin(λ);
        z0 = Math.sin(φ);
        d3_geo_centroid.point = nextPoint;
        d3_geo_centroidPointXYZ(x0, y0, z0);
      };
      function nextPoint(λ, φ) {
        λ *= d3_radians;
        var cosφ = Math.cos(φ *= d3_radians), x = cosφ * Math.cos(λ), y = cosφ * Math.sin(λ), z = Math.sin(φ), w = Math.atan2(Math.sqrt((w = y0 * z - z0 * y) * w + (w = z0 * x - x0 * z) * w + (w = x0 * y - y0 * x) * w), x0 * x + y0 * y + z0 * z);
        d3_geo_centroidW1 += w;
        d3_geo_centroidX1 += w * (x0 + (x0 = x));
        d3_geo_centroidY1 += w * (y0 + (y0 = y));
        d3_geo_centroidZ1 += w * (z0 + (z0 = z));
        d3_geo_centroidPointXYZ(x0, y0, z0);
      }
    }
    function d3_geo_centroidLineEnd() {
      d3_geo_centroid.point = d3_geo_centroidPoint;
    }
    function d3_geo_centroidRingStart() {
      var λ00, φ00, x0, y0, z0;
      d3_geo_centroid.point = function (λ, φ) {
        λ00 = λ, φ00 = φ;
        d3_geo_centroid.point = nextPoint;
        λ *= d3_radians;
        var cosφ = Math.cos(φ *= d3_radians);
        x0 = cosφ * Math.cos(λ);
        y0 = cosφ * Math.sin(λ);
        z0 = Math.sin(φ);
        d3_geo_centroidPointXYZ(x0, y0, z0);
      };
      d3_geo_centroid.lineEnd = function () {
        nextPoint(λ00, φ00);
        d3_geo_centroid.lineEnd = d3_geo_centroidLineEnd;
        d3_geo_centroid.point = d3_geo_centroidPoint;
      };
      function nextPoint(λ, φ) {
        λ *= d3_radians;
        var cosφ = Math.cos(φ *= d3_radians), x = cosφ * Math.cos(λ), y = cosφ * Math.sin(λ), z = Math.sin(φ), cx = y0 * z - z0 * y, cy = z0 * x - x0 * z, cz = x0 * y - y0 * x, m = Math.sqrt(cx * cx + cy * cy + cz * cz), u = x0 * x + y0 * y + z0 * z, v = m && -d3_acos(u) / m, w = Math.atan2(m, u);
        d3_geo_centroidX2 += v * cx;
        d3_geo_centroidY2 += v * cy;
        d3_geo_centroidZ2 += v * cz;
        d3_geo_centroidW1 += w;
        d3_geo_centroidX1 += w * (x0 + (x0 = x));
        d3_geo_centroidY1 += w * (y0 + (y0 = y));
        d3_geo_centroidZ1 += w * (z0 + (z0 = z));
        d3_geo_centroidPointXYZ(x0, y0, z0);
      }
    }
    function d3_true() {
      return true;
    }
    function d3_geo_clipPolygon(segments, compare, clipStartInside, interpolate, listener) {
      var subject = [], clip = [];
      segments.forEach(function (segment) {
        if ((n = segment.length - 1) <= 0)
          return;
        var n, p0 = segment[0], p1 = segment[n];
        if (d3_geo_sphericalEqual(p0, p1)) {
          listener.lineStart();
          for (var i = 0; i < n; ++i)
            listener.point((p0 = segment[i])[0], p0[1]);
          listener.lineEnd();
          return;
        }
        var a = {
            point: p0,
            points: segment,
            other: null,
            visited: false,
            entry: true,
            subject: true
          }, b = {
            point: p0,
            points: [p0],
            other: a,
            visited: false,
            entry: false,
            subject: false
          };
        a.other = b;
        subject.push(a);
        clip.push(b);
        a = {
          point: p1,
          points: [p1],
          other: null,
          visited: false,
          entry: false,
          subject: true
        };
        b = {
          point: p1,
          points: [p1],
          other: a,
          visited: false,
          entry: true,
          subject: false
        };
        a.other = b;
        subject.push(a);
        clip.push(b);
      });
      clip.sort(compare);
      d3_geo_clipPolygonLinkCircular(subject);
      d3_geo_clipPolygonLinkCircular(clip);
      if (!subject.length)
        return;
      for (var i = 0, entry = clipStartInside, n = clip.length; i < n; ++i) {
        clip[i].entry = entry = !entry;
      }
      var start = subject[0], current, points, point;
      while (1) {
        current = start;
        while (current.visited)
          if ((current = current.next) === start)
            return;
        points = current.points;
        listener.lineStart();
        do {
          current.visited = current.other.visited = true;
          if (current.entry) {
            if (current.subject) {
              for (var i = 0; i < points.length; i++)
                listener.point((point = points[i])[0], point[1]);
            } else {
              interpolate(current.point, current.next.point, 1, listener);
            }
            current = current.next;
          } else {
            if (current.subject) {
              points = current.prev.points;
              for (var i = points.length; --i >= 0;)
                listener.point((point = points[i])[0], point[1]);
            } else {
              interpolate(current.point, current.prev.point, -1, listener);
            }
            current = current.prev;
          }
          current = current.other;
          points = current.points;
        } while (!current.visited);
        listener.lineEnd();
      }
    }
    function d3_geo_clipPolygonLinkCircular(array) {
      if (!(n = array.length))
        return;
      var n, i = 0, a = array[0], b;
      while (++i < n) {
        a.next = b = array[i];
        b.prev = a;
        a = b;
      }
      a.next = b = array[0];
      b.prev = a;
    }
    function d3_geo_clip(pointVisible, clipLine, interpolate, clipStart) {
      return function (rotate, listener) {
        var line = clipLine(listener), rotatedClipStart = rotate.invert(clipStart[0], clipStart[1]);
        var clip = {
            point: point,
            lineStart: lineStart,
            lineEnd: lineEnd,
            polygonStart: function () {
              clip.point = pointRing;
              clip.lineStart = ringStart;
              clip.lineEnd = ringEnd;
              segments = [];
              polygon = [];
              listener.polygonStart();
            },
            polygonEnd: function () {
              clip.point = point;
              clip.lineStart = lineStart;
              clip.lineEnd = lineEnd;
              segments = d3.merge(segments);
              var clipStartInside = d3_geo_pointInPolygon(rotatedClipStart, polygon);
              if (segments.length) {
                d3_geo_clipPolygon(segments, d3_geo_clipSort, clipStartInside, interpolate, listener);
              } else if (clipStartInside) {
                listener.lineStart();
                interpolate(null, null, 1, listener);
                listener.lineEnd();
              }
              listener.polygonEnd();
              segments = polygon = null;
            },
            sphere: function () {
              listener.polygonStart();
              listener.lineStart();
              interpolate(null, null, 1, listener);
              listener.lineEnd();
              listener.polygonEnd();
            }
          };
        function point(λ, φ) {
          var point = rotate(λ, φ);
          if (pointVisible(λ = point[0], φ = point[1]))
            listener.point(λ, φ);
        }
        function pointLine(λ, φ) {
          var point = rotate(λ, φ);
          line.point(point[0], point[1]);
        }
        function lineStart() {
          clip.point = pointLine;
          line.lineStart();
        }
        function lineEnd() {
          clip.point = point;
          line.lineEnd();
        }
        var segments;
        var buffer = d3_geo_clipBufferListener(), ringListener = clipLine(buffer), polygon, ring;
        function pointRing(λ, φ) {
          ring.push([
            λ,
            φ
          ]);
          var point = rotate(λ, φ);
          ringListener.point(point[0], point[1]);
        }
        function ringStart() {
          ringListener.lineStart();
          ring = [];
        }
        function ringEnd() {
          pointRing(ring[0][0], ring[0][1]);
          ringListener.lineEnd();
          var clean = ringListener.clean(), ringSegments = buffer.buffer(), segment, n = ringSegments.length;
          ring.pop();
          polygon.push(ring);
          ring = null;
          if (!n)
            return;
          if (clean & 1) {
            segment = ringSegments[0];
            var n = segment.length - 1, i = -1, point;
            listener.lineStart();
            while (++i < n)
              listener.point((point = segment[i])[0], point[1]);
            listener.lineEnd();
            return;
          }
          if (n > 1 && clean & 2)
            ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));
          segments.push(ringSegments.filter(d3_geo_clipSegmentLength1));
        }
        return clip;
      };
    }
    function d3_geo_clipSegmentLength1(segment) {
      return segment.length > 1;
    }
    function d3_geo_clipBufferListener() {
      var lines = [], line;
      return {
        lineStart: function () {
          lines.push(line = []);
        },
        point: function (λ, φ) {
          line.push([
            λ,
            φ
          ]);
        },
        lineEnd: d3_noop,
        buffer: function () {
          var buffer = lines;
          lines = [];
          line = null;
          return buffer;
        },
        rejoin: function () {
          if (lines.length > 1)
            lines.push(lines.pop().concat(lines.shift()));
        }
      };
    }
    function d3_geo_clipSort(a, b) {
      return ((a = a.point)[0] < 0 ? a[1] - halfπ - ε : halfπ - a[1]) - ((b = b.point)[0] < 0 ? b[1] - halfπ - ε : halfπ - b[1]);
    }
    function d3_geo_pointInPolygon(point, polygon) {
      var meridian = point[0], parallel = point[1], meridianNormal = [
          Math.sin(meridian),
          -Math.cos(meridian),
          0
        ], polarAngle = 0, winding = 0;
      d3_geo_areaRingSum.reset();
      for (var i = 0, n = polygon.length; i < n; ++i) {
        var ring = polygon[i], m = ring.length;
        if (!m)
          continue;
        var point0 = ring[0], λ0 = point0[0], φ0 = point0[1] / 2 + π / 4, sinφ0 = Math.sin(φ0), cosφ0 = Math.cos(φ0), j = 1;
        while (true) {
          if (j === m)
            j = 0;
          point = ring[j];
          var λ = point[0], φ = point[1] / 2 + π / 4, sinφ = Math.sin(φ), cosφ = Math.cos(φ), dλ = λ - λ0, antimeridian = Math.abs(dλ) > π, k = sinφ0 * sinφ;
          d3_geo_areaRingSum.add(Math.atan2(k * Math.sin(dλ), cosφ0 * cosφ + k * Math.cos(dλ)));
          polarAngle += antimeridian ? dλ + (dλ >= 0 ? 2 : -2) * π : dλ;
          if (antimeridian ^ λ0 >= meridian ^ λ >= meridian) {
            var arc = d3_geo_cartesianCross(d3_geo_cartesian(point0), d3_geo_cartesian(point));
            d3_geo_cartesianNormalize(arc);
            var intersection = d3_geo_cartesianCross(meridianNormal, arc);
            d3_geo_cartesianNormalize(intersection);
            var φarc = (antimeridian ^ dλ >= 0 ? -1 : 1) * d3_asin(intersection[2]);
            if (parallel > φarc || parallel === φarc && (arc[0] || arc[1])) {
              winding += antimeridian ^ dλ >= 0 ? 1 : -1;
            }
          }
          if (!j++)
            break;
          λ0 = λ, sinφ0 = sinφ, cosφ0 = cosφ, point0 = point;
        }
      }
      return (polarAngle < -ε || polarAngle < ε && d3_geo_areaRingSum < 0) ^ winding & 1;
    }
    var d3_geo_clipAntimeridian = d3_geo_clip(d3_true, d3_geo_clipAntimeridianLine, d3_geo_clipAntimeridianInterpolate, [
        -π,
        -π / 2
      ]);
    function d3_geo_clipAntimeridianLine(listener) {
      var λ0 = NaN, φ0 = NaN, sλ0 = NaN, clean;
      return {
        lineStart: function () {
          listener.lineStart();
          clean = 1;
        },
        point: function (λ1, φ1) {
          var sλ1 = λ1 > 0 ? π : -π, dλ = Math.abs(λ1 - λ0);
          if (Math.abs(dλ - π) < ε) {
            listener.point(λ0, φ0 = (φ0 + φ1) / 2 > 0 ? halfπ : -halfπ);
            listener.point(sλ0, φ0);
            listener.lineEnd();
            listener.lineStart();
            listener.point(sλ1, φ0);
            listener.point(λ1, φ0);
            clean = 0;
          } else if (sλ0 !== sλ1 && dλ >= π) {
            if (Math.abs(λ0 - sλ0) < ε)
              λ0 -= sλ0 * ε;
            if (Math.abs(λ1 - sλ1) < ε)
              λ1 -= sλ1 * ε;
            φ0 = d3_geo_clipAntimeridianIntersect(λ0, φ0, λ1, φ1);
            listener.point(sλ0, φ0);
            listener.lineEnd();
            listener.lineStart();
            listener.point(sλ1, φ0);
            clean = 0;
          }
          listener.point(λ0 = λ1, φ0 = φ1);
          sλ0 = sλ1;
        },
        lineEnd: function () {
          listener.lineEnd();
          λ0 = φ0 = NaN;
        },
        clean: function () {
          return 2 - clean;
        }
      };
    }
    function d3_geo_clipAntimeridianIntersect(λ0, φ0, λ1, φ1) {
      var cosφ0, cosφ1, sinλ0_λ1 = Math.sin(λ0 - λ1);
      return Math.abs(sinλ0_λ1) > ε ? Math.atan((Math.sin(φ0) * (cosφ1 = Math.cos(φ1)) * Math.sin(λ1) - Math.sin(φ1) * (cosφ0 = Math.cos(φ0)) * Math.sin(λ0)) / (cosφ0 * cosφ1 * sinλ0_λ1)) : (φ0 + φ1) / 2;
    }
    function d3_geo_clipAntimeridianInterpolate(from, to, direction, listener) {
      var φ;
      if (from == null) {
        φ = direction * halfπ;
        listener.point(-π, φ);
        listener.point(0, φ);
        listener.point(π, φ);
        listener.point(π, 0);
        listener.point(π, -φ);
        listener.point(0, -φ);
        listener.point(-π, -φ);
        listener.point(-π, 0);
        listener.point(-π, φ);
      } else if (Math.abs(from[0] - to[0]) > ε) {
        var s = (from[0] < to[0] ? 1 : -1) * π;
        φ = direction * s / 2;
        listener.point(-s, φ);
        listener.point(0, φ);
        listener.point(s, φ);
      } else {
        listener.point(to[0], to[1]);
      }
    }
    function d3_geo_clipCircle(radius) {
      var cr = Math.cos(radius), smallRadius = cr > 0, notHemisphere = Math.abs(cr) > ε, interpolate = d3_geo_circleInterpolate(radius, 6 * d3_radians);
      return d3_geo_clip(visible, clipLine, interpolate, smallRadius ? [
        0,
        -radius
      ] : [
        -π,
        radius - π
      ]);
      function visible(λ, φ) {
        return Math.cos(λ) * Math.cos(φ) > cr;
      }
      function clipLine(listener) {
        var point0, c0, v0, v00, clean;
        return {
          lineStart: function () {
            v00 = v0 = false;
            clean = 1;
          },
          point: function (λ, φ) {
            var point1 = [
                λ,
                φ
              ], point2, v = visible(λ, φ), c = smallRadius ? v ? 0 : code(λ, φ) : v ? code(λ + (λ < 0 ? π : -π), φ) : 0;
            if (!point0 && (v00 = v0 = v))
              listener.lineStart();
            if (v !== v0) {
              point2 = intersect(point0, point1);
              if (d3_geo_sphericalEqual(point0, point2) || d3_geo_sphericalEqual(point1, point2)) {
                point1[0] += ε;
                point1[1] += ε;
                v = visible(point1[0], point1[1]);
              }
            }
            if (v !== v0) {
              clean = 0;
              if (v) {
                listener.lineStart();
                point2 = intersect(point1, point0);
                listener.point(point2[0], point2[1]);
              } else {
                point2 = intersect(point0, point1);
                listener.point(point2[0], point2[1]);
                listener.lineEnd();
              }
              point0 = point2;
            } else if (notHemisphere && point0 && smallRadius ^ v) {
              var t;
              if (!(c & c0) && (t = intersect(point1, point0, true))) {
                clean = 0;
                if (smallRadius) {
                  listener.lineStart();
                  listener.point(t[0][0], t[0][1]);
                  listener.point(t[1][0], t[1][1]);
                  listener.lineEnd();
                } else {
                  listener.point(t[1][0], t[1][1]);
                  listener.lineEnd();
                  listener.lineStart();
                  listener.point(t[0][0], t[0][1]);
                }
              }
            }
            if (v && (!point0 || !d3_geo_sphericalEqual(point0, point1))) {
              listener.point(point1[0], point1[1]);
            }
            point0 = point1, v0 = v, c0 = c;
          },
          lineEnd: function () {
            if (v0)
              listener.lineEnd();
            point0 = null;
          },
          clean: function () {
            return clean | (v00 && v0) << 1;
          }
        };
      }
      function intersect(a, b, two) {
        var pa = d3_geo_cartesian(a), pb = d3_geo_cartesian(b);
        var n1 = [
            1,
            0,
            0
          ], n2 = d3_geo_cartesianCross(pa, pb), n2n2 = d3_geo_cartesianDot(n2, n2), n1n2 = n2[0], determinant = n2n2 - n1n2 * n1n2;
        if (!determinant)
          return !two && a;
        var c1 = cr * n2n2 / determinant, c2 = -cr * n1n2 / determinant, n1xn2 = d3_geo_cartesianCross(n1, n2), A = d3_geo_cartesianScale(n1, c1), B = d3_geo_cartesianScale(n2, c2);
        d3_geo_cartesianAdd(A, B);
        var u = n1xn2, w = d3_geo_cartesianDot(A, u), uu = d3_geo_cartesianDot(u, u), t2 = w * w - uu * (d3_geo_cartesianDot(A, A) - 1);
        if (t2 < 0)
          return;
        var t = Math.sqrt(t2), q = d3_geo_cartesianScale(u, (-w - t) / uu);
        d3_geo_cartesianAdd(q, A);
        q = d3_geo_spherical(q);
        if (!two)
          return q;
        var λ0 = a[0], λ1 = b[0], φ0 = a[1], φ1 = b[1], z;
        if (λ1 < λ0)
          z = λ0, λ0 = λ1, λ1 = z;
        var δλ = λ1 - λ0, polar = Math.abs(δλ - π) < ε, meridian = polar || δλ < ε;
        if (!polar && φ1 < φ0)
          z = φ0, φ0 = φ1, φ1 = z;
        if (meridian ? polar ? φ0 + φ1 > 0 ^ q[1] < (Math.abs(q[0] - λ0) < ε ? φ0 : φ1) : φ0 <= q[1] && q[1] <= φ1 : δλ > π ^ (λ0 <= q[0] && q[0] <= λ1)) {
          var q1 = d3_geo_cartesianScale(u, (-w + t) / uu);
          d3_geo_cartesianAdd(q1, A);
          return [
            q,
            d3_geo_spherical(q1)
          ];
        }
      }
      function code(λ, φ) {
        var r = smallRadius ? radius : π - radius, code = 0;
        if (λ < -r)
          code |= 1;
        else if (λ > r)
          code |= 2;
        if (φ < -r)
          code |= 4;
        else if (φ > r)
          code |= 8;
        return code;
      }
    }
    var d3_geo_clipExtentMAX = 1000000000;
    d3.geo.clipExtent = function () {
      var x0, y0, x1, y1, stream, clip, clipExtent = {
          stream: function (output) {
            if (stream)
              stream.valid = false;
            stream = clip(output);
            stream.valid = true;
            return stream;
          },
          extent: function (_) {
            if (!arguments.length)
              return [
                [
                  x0,
                  y0
                ],
                [
                  x1,
                  y1
                ]
              ];
            clip = d3_geo_clipExtent(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]);
            if (stream)
              stream.valid = false, stream = null;
            return clipExtent;
          }
        };
      return clipExtent.extent([
        [
          0,
          0
        ],
        [
          960,
          500
        ]
      ]);
    };
    function d3_geo_clipExtent(x0, y0, x1, y1) {
      return function (listener) {
        var listener_ = listener, bufferListener = d3_geo_clipBufferListener(), segments, polygon, ring;
        var clip = {
            point: point,
            lineStart: lineStart,
            lineEnd: lineEnd,
            polygonStart: function () {
              listener = bufferListener;
              segments = [];
              polygon = [];
              clean = true;
            },
            polygonEnd: function () {
              listener = listener_;
              segments = d3.merge(segments);
              var clipStartInside = insidePolygon([
                  x0,
                  y1
                ]), inside = clean && clipStartInside, visible = segments.length;
              if (inside || visible) {
                listener.polygonStart();
                if (inside) {
                  listener.lineStart();
                  interpolate(null, null, 1, listener);
                  listener.lineEnd();
                }
                if (visible) {
                  d3_geo_clipPolygon(segments, compare, clipStartInside, interpolate, listener);
                }
                listener.polygonEnd();
              }
              segments = polygon = ring = null;
            }
          };
        function insidePolygon(p) {
          var wn = 0, n = polygon.length, y = p[1];
          for (var i = 0; i < n; ++i) {
            for (var j = 1, v = polygon[i], m = v.length, a = v[0], b; j < m; ++j) {
              b = v[j];
              if (a[1] <= y) {
                if (b[1] > y && isLeft(a, b, p) > 0)
                  ++wn;
              } else {
                if (b[1] <= y && isLeft(a, b, p) < 0)
                  --wn;
              }
              a = b;
            }
          }
          return wn !== 0;
        }
        function isLeft(a, b, c) {
          return (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]);
        }
        function interpolate(from, to, direction, listener) {
          var a = 0, a1 = 0;
          if (from == null || (a = corner(from, direction)) !== (a1 = corner(to, direction)) || comparePoints(from, to) < 0 ^ direction > 0) {
            do {
              listener.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
            } while ((a = (a + direction + 4) % 4) !== a1);
          } else {
            listener.point(to[0], to[1]);
          }
        }
        function pointVisible(x, y) {
          return x0 <= x && x <= x1 && y0 <= y && y <= y1;
        }
        function point(x, y) {
          if (pointVisible(x, y))
            listener.point(x, y);
        }
        var x__, y__, v__, x_, y_, v_, first, clean;
        function lineStart() {
          clip.point = linePoint;
          if (polygon)
            polygon.push(ring = []);
          first = true;
          v_ = false;
          x_ = y_ = NaN;
        }
        function lineEnd() {
          if (segments) {
            linePoint(x__, y__);
            if (v__ && v_)
              bufferListener.rejoin();
            segments.push(bufferListener.buffer());
          }
          clip.point = point;
          if (v_)
            listener.lineEnd();
        }
        function linePoint(x, y) {
          x = Math.max(-d3_geo_clipExtentMAX, Math.min(d3_geo_clipExtentMAX, x));
          y = Math.max(-d3_geo_clipExtentMAX, Math.min(d3_geo_clipExtentMAX, y));
          var v = pointVisible(x, y);
          if (polygon)
            ring.push([
              x,
              y
            ]);
          if (first) {
            x__ = x, y__ = y, v__ = v;
            first = false;
            if (v) {
              listener.lineStart();
              listener.point(x, y);
            }
          } else {
            if (v && v_)
              listener.point(x, y);
            else {
              var a = [
                  x_,
                  y_
                ], b = [
                  x,
                  y
                ];
              if (clipLine(a, b)) {
                if (!v_) {
                  listener.lineStart();
                  listener.point(a[0], a[1]);
                }
                listener.point(b[0], b[1]);
                if (!v)
                  listener.lineEnd();
                clean = false;
              } else if (v) {
                listener.lineStart();
                listener.point(x, y);
                clean = false;
              }
            }
          }
          x_ = x, y_ = y, v_ = v;
        }
        return clip;
      };
      function corner(p, direction) {
        return Math.abs(p[0] - x0) < ε ? direction > 0 ? 0 : 3 : Math.abs(p[0] - x1) < ε ? direction > 0 ? 2 : 1 : Math.abs(p[1] - y0) < ε ? direction > 0 ? 1 : 0 : direction > 0 ? 3 : 2;
      }
      function compare(a, b) {
        return comparePoints(a.point, b.point);
      }
      function comparePoints(a, b) {
        var ca = corner(a, 1), cb = corner(b, 1);
        return ca !== cb ? ca - cb : ca === 0 ? b[1] - a[1] : ca === 1 ? a[0] - b[0] : ca === 2 ? a[1] - b[1] : b[0] - a[0];
      }
      function clipLine(a, b) {
        var dx = b[0] - a[0], dy = b[1] - a[1], t = [
            0,
            1
          ];
        if (Math.abs(dx) < ε && Math.abs(dy) < ε)
          return x0 <= a[0] && a[0] <= x1 && y0 <= a[1] && a[1] <= y1;
        if (d3_geo_clipExtentT(x0 - a[0], dx, t) && d3_geo_clipExtentT(a[0] - x1, -dx, t) && d3_geo_clipExtentT(y0 - a[1], dy, t) && d3_geo_clipExtentT(a[1] - y1, -dy, t)) {
          if (t[1] < 1) {
            b[0] = a[0] + t[1] * dx;
            b[1] = a[1] + t[1] * dy;
          }
          if (t[0] > 0) {
            a[0] += t[0] * dx;
            a[1] += t[0] * dy;
          }
          return true;
        }
        return false;
      }
    }
    function d3_geo_clipExtentT(num, denominator, t) {
      if (Math.abs(denominator) < ε)
        return num <= 0;
      var u = num / denominator;
      if (denominator > 0) {
        if (u > t[1])
          return false;
        if (u > t[0])
          t[0] = u;
      } else {
        if (u < t[0])
          return false;
        if (u < t[1])
          t[1] = u;
      }
      return true;
    }
    function d3_geo_compose(a, b) {
      function compose(x, y) {
        return x = a(x, y), b(x[0], x[1]);
      }
      if (a.invert && b.invert)
        compose.invert = function (x, y) {
          return x = b.invert(x, y), x && a.invert(x[0], x[1]);
        };
      return compose;
    }
    function d3_geo_conic(projectAt) {
      var φ0 = 0, φ1 = π / 3, m = d3_geo_projectionMutator(projectAt), p = m(φ0, φ1);
      p.parallels = function (_) {
        if (!arguments.length)
          return [
            φ0 / π * 180,
            φ1 / π * 180
          ];
        return m(φ0 = _[0] * π / 180, φ1 = _[1] * π / 180);
      };
      return p;
    }
    function d3_geo_conicEqualArea(φ0, φ1) {
      var sinφ0 = Math.sin(φ0), n = (sinφ0 + Math.sin(φ1)) / 2, C = 1 + sinφ0 * (2 * n - sinφ0), ρ0 = Math.sqrt(C) / n;
      function forward(λ, φ) {
        var ρ = Math.sqrt(C - 2 * n * Math.sin(φ)) / n;
        return [
          ρ * Math.sin(λ *= n),
          ρ0 - ρ * Math.cos(λ)
        ];
      }
      forward.invert = function (x, y) {
        var ρ0_y = ρ0 - y;
        return [
          Math.atan2(x, ρ0_y) / n,
          d3_asin((C - (x * x + ρ0_y * ρ0_y) * n * n) / (2 * n))
        ];
      };
      return forward;
    }
    (d3.geo.conicEqualArea = function () {
      return d3_geo_conic(d3_geo_conicEqualArea);
    }).raw = d3_geo_conicEqualArea;
    d3.geo.albers = function () {
      return d3.geo.conicEqualArea().rotate([
        96,
        0
      ]).center([
        -0.6,
        38.7
      ]).parallels([
        29.5,
        45.5
      ]).scale(1070);
    };
    d3.geo.albersUsa = function () {
      var lower48 = d3.geo.albers();
      var alaska = d3.geo.conicEqualArea().rotate([
          154,
          0
        ]).center([
          -2,
          58.5
        ]).parallels([
          55,
          65
        ]);
      var hawaii = d3.geo.conicEqualArea().rotate([
          157,
          0
        ]).center([
          -3,
          19.9
        ]).parallels([
          8,
          18
        ]);
      var point, pointStream = {
          point: function (x, y) {
            point = [
              x,
              y
            ];
          }
        }, lower48Point, alaskaPoint, hawaiiPoint;
      function albersUsa(coordinates) {
        var x = coordinates[0], y = coordinates[1];
        point = null;
        (lower48Point(x, y), point) || (alaskaPoint(x, y), point) || hawaiiPoint(x, y);
        return point;
      }
      albersUsa.invert = function (coordinates) {
        var k = lower48.scale(), t = lower48.translate(), x = (coordinates[0] - t[0]) / k, y = (coordinates[1] - t[1]) / k;
        return (y >= 0.12 && y < 0.234 && x >= -0.425 && x < -0.214 ? alaska : y >= 0.166 && y < 0.234 && x >= -0.214 && x < -0.115 ? hawaii : lower48).invert(coordinates);
      };
      albersUsa.stream = function (stream) {
        var lower48Stream = lower48.stream(stream), alaskaStream = alaska.stream(stream), hawaiiStream = hawaii.stream(stream);
        return {
          point: function (x, y) {
            lower48Stream.point(x, y);
            alaskaStream.point(x, y);
            hawaiiStream.point(x, y);
          },
          sphere: function () {
            lower48Stream.sphere();
            alaskaStream.sphere();
            hawaiiStream.sphere();
          },
          lineStart: function () {
            lower48Stream.lineStart();
            alaskaStream.lineStart();
            hawaiiStream.lineStart();
          },
          lineEnd: function () {
            lower48Stream.lineEnd();
            alaskaStream.lineEnd();
            hawaiiStream.lineEnd();
          },
          polygonStart: function () {
            lower48Stream.polygonStart();
            alaskaStream.polygonStart();
            hawaiiStream.polygonStart();
          },
          polygonEnd: function () {
            lower48Stream.polygonEnd();
            alaskaStream.polygonEnd();
            hawaiiStream.polygonEnd();
          }
        };
      };
      albersUsa.precision = function (_) {
        if (!arguments.length)
          return lower48.precision();
        lower48.precision(_);
        alaska.precision(_);
        hawaii.precision(_);
        return albersUsa;
      };
      albersUsa.scale = function (_) {
        if (!arguments.length)
          return lower48.scale();
        lower48.scale(_);
        alaska.scale(_ * 0.35);
        hawaii.scale(_);
        return albersUsa.translate(lower48.translate());
      };
      albersUsa.translate = function (_) {
        if (!arguments.length)
          return lower48.translate();
        var k = lower48.scale(), x = +_[0], y = +_[1];
        lower48Point = lower48.translate(_).clipExtent([
          [
            x - 0.455 * k,
            y - 0.238 * k
          ],
          [
            x + 0.455 * k,
            y + 0.238 * k
          ]
        ]).stream(pointStream).point;
        alaskaPoint = alaska.translate([
          x - 0.307 * k,
          y + 0.201 * k
        ]).clipExtent([
          [
            x - 0.425 * k + ε,
            y + 0.12 * k + ε
          ],
          [
            x - 0.214 * k - ε,
            y + 0.234 * k - ε
          ]
        ]).stream(pointStream).point;
        hawaiiPoint = hawaii.translate([
          x - 0.205 * k,
          y + 0.212 * k
        ]).clipExtent([
          [
            x - 0.214 * k + ε,
            y + 0.166 * k + ε
          ],
          [
            x - 0.115 * k - ε,
            y + 0.234 * k - ε
          ]
        ]).stream(pointStream).point;
        return albersUsa;
      };
      return albersUsa.scale(1070);
    };
    var d3_geo_pathAreaSum, d3_geo_pathAreaPolygon, d3_geo_pathArea = {
        point: d3_noop,
        lineStart: d3_noop,
        lineEnd: d3_noop,
        polygonStart: function () {
          d3_geo_pathAreaPolygon = 0;
          d3_geo_pathArea.lineStart = d3_geo_pathAreaRingStart;
        },
        polygonEnd: function () {
          d3_geo_pathArea.lineStart = d3_geo_pathArea.lineEnd = d3_geo_pathArea.point = d3_noop;
          d3_geo_pathAreaSum += Math.abs(d3_geo_pathAreaPolygon / 2);
        }
      };
    function d3_geo_pathAreaRingStart() {
      var x00, y00, x0, y0;
      d3_geo_pathArea.point = function (x, y) {
        d3_geo_pathArea.point = nextPoint;
        x00 = x0 = x, y00 = y0 = y;
      };
      function nextPoint(x, y) {
        d3_geo_pathAreaPolygon += y0 * x - x0 * y;
        x0 = x, y0 = y;
      }
      d3_geo_pathArea.lineEnd = function () {
        nextPoint(x00, y00);
      };
    }
    var d3_geo_pathBoundsX0, d3_geo_pathBoundsY0, d3_geo_pathBoundsX1, d3_geo_pathBoundsY1;
    var d3_geo_pathBounds = {
        point: d3_geo_pathBoundsPoint,
        lineStart: d3_noop,
        lineEnd: d3_noop,
        polygonStart: d3_noop,
        polygonEnd: d3_noop
      };
    function d3_geo_pathBoundsPoint(x, y) {
      if (x < d3_geo_pathBoundsX0)
        d3_geo_pathBoundsX0 = x;
      if (x > d3_geo_pathBoundsX1)
        d3_geo_pathBoundsX1 = x;
      if (y < d3_geo_pathBoundsY0)
        d3_geo_pathBoundsY0 = y;
      if (y > d3_geo_pathBoundsY1)
        d3_geo_pathBoundsY1 = y;
    }
    function d3_geo_pathBuffer() {
      var pointCircle = d3_geo_pathBufferCircle(4.5), buffer = [];
      var stream = {
          point: point,
          lineStart: function () {
            stream.point = pointLineStart;
          },
          lineEnd: lineEnd,
          polygonStart: function () {
            stream.lineEnd = lineEndPolygon;
          },
          polygonEnd: function () {
            stream.lineEnd = lineEnd;
            stream.point = point;
          },
          pointRadius: function (_) {
            pointCircle = d3_geo_pathBufferCircle(_);
            return stream;
          },
          result: function () {
            if (buffer.length) {
              var result = buffer.join('');
              buffer = [];
              return result;
            }
          }
        };
      function point(x, y) {
        buffer.push('M', x, ',', y, pointCircle);
      }
      function pointLineStart(x, y) {
        buffer.push('M', x, ',', y);
        stream.point = pointLine;
      }
      function pointLine(x, y) {
        buffer.push('L', x, ',', y);
      }
      function lineEnd() {
        stream.point = point;
      }
      function lineEndPolygon() {
        buffer.push('Z');
      }
      return stream;
    }
    function d3_geo_pathBufferCircle(radius) {
      return 'm0,' + radius + 'a' + radius + ',' + radius + ' 0 1,1 0,' + -2 * radius + 'a' + radius + ',' + radius + ' 0 1,1 0,' + 2 * radius + 'z';
    }
    var d3_geo_pathCentroid = {
        point: d3_geo_pathCentroidPoint,
        lineStart: d3_geo_pathCentroidLineStart,
        lineEnd: d3_geo_pathCentroidLineEnd,
        polygonStart: function () {
          d3_geo_pathCentroid.lineStart = d3_geo_pathCentroidRingStart;
        },
        polygonEnd: function () {
          d3_geo_pathCentroid.point = d3_geo_pathCentroidPoint;
          d3_geo_pathCentroid.lineStart = d3_geo_pathCentroidLineStart;
          d3_geo_pathCentroid.lineEnd = d3_geo_pathCentroidLineEnd;
        }
      };
    function d3_geo_pathCentroidPoint(x, y) {
      d3_geo_centroidX0 += x;
      d3_geo_centroidY0 += y;
      ++d3_geo_centroidZ0;
    }
    function d3_geo_pathCentroidLineStart() {
      var x0, y0;
      d3_geo_pathCentroid.point = function (x, y) {
        d3_geo_pathCentroid.point = nextPoint;
        d3_geo_pathCentroidPoint(x0 = x, y0 = y);
      };
      function nextPoint(x, y) {
        var dx = x - x0, dy = y - y0, z = Math.sqrt(dx * dx + dy * dy);
        d3_geo_centroidX1 += z * (x0 + x) / 2;
        d3_geo_centroidY1 += z * (y0 + y) / 2;
        d3_geo_centroidZ1 += z;
        d3_geo_pathCentroidPoint(x0 = x, y0 = y);
      }
    }
    function d3_geo_pathCentroidLineEnd() {
      d3_geo_pathCentroid.point = d3_geo_pathCentroidPoint;
    }
    function d3_geo_pathCentroidRingStart() {
      var x00, y00, x0, y0;
      d3_geo_pathCentroid.point = function (x, y) {
        d3_geo_pathCentroid.point = nextPoint;
        d3_geo_pathCentroidPoint(x00 = x0 = x, y00 = y0 = y);
      };
      function nextPoint(x, y) {
        var dx = x - x0, dy = y - y0, z = Math.sqrt(dx * dx + dy * dy);
        d3_geo_centroidX1 += z * (x0 + x) / 2;
        d3_geo_centroidY1 += z * (y0 + y) / 2;
        d3_geo_centroidZ1 += z;
        z = y0 * x - x0 * y;
        d3_geo_centroidX2 += z * (x0 + x);
        d3_geo_centroidY2 += z * (y0 + y);
        d3_geo_centroidZ2 += z * 3;
        d3_geo_pathCentroidPoint(x0 = x, y0 = y);
      }
      d3_geo_pathCentroid.lineEnd = function () {
        nextPoint(x00, y00);
      };
    }
    function d3_geo_pathContext(context) {
      var pointRadius = 4.5;
      var stream = {
          point: point,
          lineStart: function () {
            stream.point = pointLineStart;
          },
          lineEnd: lineEnd,
          polygonStart: function () {
            stream.lineEnd = lineEndPolygon;
          },
          polygonEnd: function () {
            stream.lineEnd = lineEnd;
            stream.point = point;
          },
          pointRadius: function (_) {
            pointRadius = _;
            return stream;
          },
          result: d3_noop
        };
      function point(x, y) {
        context.moveTo(x, y);
        context.arc(x, y, pointRadius, 0, τ);
      }
      function pointLineStart(x, y) {
        context.moveTo(x, y);
        stream.point = pointLine;
      }
      function pointLine(x, y) {
        context.lineTo(x, y);
      }
      function lineEnd() {
        stream.point = point;
      }
      function lineEndPolygon() {
        context.closePath();
      }
      return stream;
    }
    function d3_geo_resample(project) {
      var δ2 = 0.5, cosMinDistance = Math.cos(30 * d3_radians), maxDepth = 16;
      function resample(stream) {
        var λ00, φ00, x00, y00, a00, b00, c00, λ0, x0, y0, a0, b0, c0;
        var resample = {
            point: point,
            lineStart: lineStart,
            lineEnd: lineEnd,
            polygonStart: function () {
              stream.polygonStart();
              resample.lineStart = ringStart;
            },
            polygonEnd: function () {
              stream.polygonEnd();
              resample.lineStart = lineStart;
            }
          };
        function point(x, y) {
          x = project(x, y);
          stream.point(x[0], x[1]);
        }
        function lineStart() {
          x0 = NaN;
          resample.point = linePoint;
          stream.lineStart();
        }
        function linePoint(λ, φ) {
          var c = d3_geo_cartesian([
              λ,
              φ
            ]), p = project(λ, φ);
          resampleLineTo(x0, y0, λ0, a0, b0, c0, x0 = p[0], y0 = p[1], λ0 = λ, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
          stream.point(x0, y0);
        }
        function lineEnd() {
          resample.point = point;
          stream.lineEnd();
        }
        function ringStart() {
          lineStart();
          resample.point = ringPoint;
          resample.lineEnd = ringEnd;
        }
        function ringPoint(λ, φ) {
          linePoint(λ00 = λ, φ00 = φ), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
          resample.point = linePoint;
        }
        function ringEnd() {
          resampleLineTo(x0, y0, λ0, a0, b0, c0, x00, y00, λ00, a00, b00, c00, maxDepth, stream);
          resample.lineEnd = lineEnd;
          lineEnd();
        }
        return resample;
      }
      function resampleLineTo(x0, y0, λ0, a0, b0, c0, x1, y1, λ1, a1, b1, c1, depth, stream) {
        var dx = x1 - x0, dy = y1 - y0, d2 = dx * dx + dy * dy;
        if (d2 > 4 * δ2 && depth--) {
          var a = a0 + a1, b = b0 + b1, c = c0 + c1, m = Math.sqrt(a * a + b * b + c * c), φ2 = Math.asin(c /= m), λ2 = Math.abs(Math.abs(c) - 1) < ε ? (λ0 + λ1) / 2 : Math.atan2(b, a), p = project(λ2, φ2), x2 = p[0], y2 = p[1], dx2 = x2 - x0, dy2 = y2 - y0, dz = dy * dx2 - dx * dy2;
          if (dz * dz / d2 > δ2 || Math.abs((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) {
            resampleLineTo(x0, y0, λ0, a0, b0, c0, x2, y2, λ2, a /= m, b /= m, c, depth, stream);
            stream.point(x2, y2);
            resampleLineTo(x2, y2, λ2, a, b, c, x1, y1, λ1, a1, b1, c1, depth, stream);
          }
        }
      }
      resample.precision = function (_) {
        if (!arguments.length)
          return Math.sqrt(δ2);
        maxDepth = (δ2 = _ * _) > 0 && 16;
        return resample;
      };
      return resample;
    }
    d3.geo.transform = function (methods) {
      return {
        stream: function (stream) {
          var transform = new d3_geo_transform(stream);
          for (var k in methods)
            transform[k] = methods[k];
          return transform;
        }
      };
    };
    function d3_geo_transform(stream) {
      this.stream = stream;
    }
    d3_geo_transform.prototype = {
      point: function (x, y) {
        this.stream.point(x, y);
      },
      sphere: function () {
        this.stream.sphere();
      },
      lineStart: function () {
        this.stream.lineStart();
      },
      lineEnd: function () {
        this.stream.lineEnd();
      },
      polygonStart: function () {
        this.stream.polygonStart();
      },
      polygonEnd: function () {
        this.stream.polygonEnd();
      }
    };
    d3.geo.path = function () {
      var pointRadius = 4.5, projection, context, projectStream, contextStream, cacheStream;
      function path(object) {
        if (object) {
          if (typeof pointRadius === 'function')
            contextStream.pointRadius(+pointRadius.apply(this, arguments));
          if (!cacheStream || !cacheStream.valid)
            cacheStream = projectStream(contextStream);
          d3.geo.stream(object, cacheStream);
        }
        return contextStream.result();
      }
      path.area = function (object) {
        d3_geo_pathAreaSum = 0;
        d3.geo.stream(object, projectStream(d3_geo_pathArea));
        return d3_geo_pathAreaSum;
      };
      path.centroid = function (object) {
        d3_geo_centroidX0 = d3_geo_centroidY0 = d3_geo_centroidZ0 = d3_geo_centroidX1 = d3_geo_centroidY1 = d3_geo_centroidZ1 = d3_geo_centroidX2 = d3_geo_centroidY2 = d3_geo_centroidZ2 = 0;
        d3.geo.stream(object, projectStream(d3_geo_pathCentroid));
        return d3_geo_centroidZ2 ? [
          d3_geo_centroidX2 / d3_geo_centroidZ2,
          d3_geo_centroidY2 / d3_geo_centroidZ2
        ] : d3_geo_centroidZ1 ? [
          d3_geo_centroidX1 / d3_geo_centroidZ1,
          d3_geo_centroidY1 / d3_geo_centroidZ1
        ] : d3_geo_centroidZ0 ? [
          d3_geo_centroidX0 / d3_geo_centroidZ0,
          d3_geo_centroidY0 / d3_geo_centroidZ0
        ] : [
          NaN,
          NaN
        ];
      };
      path.bounds = function (object) {
        d3_geo_pathBoundsX1 = d3_geo_pathBoundsY1 = -(d3_geo_pathBoundsX0 = d3_geo_pathBoundsY0 = Infinity);
        d3.geo.stream(object, projectStream(d3_geo_pathBounds));
        return [
          [
            d3_geo_pathBoundsX0,
            d3_geo_pathBoundsY0
          ],
          [
            d3_geo_pathBoundsX1,
            d3_geo_pathBoundsY1
          ]
        ];
      };
      path.projection = function (_) {
        if (!arguments.length)
          return projection;
        projectStream = (projection = _) ? _.stream || d3_geo_pathProjectStream(_) : d3_identity;
        return reset();
      };
      path.context = function (_) {
        if (!arguments.length)
          return context;
        contextStream = (context = _) == null ? new d3_geo_pathBuffer() : new d3_geo_pathContext(_);
        if (typeof pointRadius !== 'function')
          contextStream.pointRadius(pointRadius);
        return reset();
      };
      path.pointRadius = function (_) {
        if (!arguments.length)
          return pointRadius;
        pointRadius = typeof _ === 'function' ? _ : (contextStream.pointRadius(+_), +_);
        return path;
      };
      function reset() {
        cacheStream = null;
        return path;
      }
      return path.projection(d3.geo.albersUsa()).context(null);
    };
    function d3_geo_pathProjectStream(project) {
      var resample = d3_geo_resample(function (x, y) {
          return project([
            x * d3_degrees,
            y * d3_degrees
          ]);
        });
      return function (stream) {
        var transform = new d3_geo_transform(stream = resample(stream));
        transform.point = function (x, y) {
          stream.point(x * d3_radians, y * d3_radians);
        };
        return transform;
      };
    }
    d3.geo.projection = d3_geo_projection;
    d3.geo.projectionMutator = d3_geo_projectionMutator;
    function d3_geo_projection(project) {
      return d3_geo_projectionMutator(function () {
        return project;
      })();
    }
    function d3_geo_projectionMutator(projectAt) {
      var project, rotate, projectRotate, projectResample = d3_geo_resample(function (x, y) {
          x = project(x, y);
          return [
            x[0] * k + δx,
            δy - x[1] * k
          ];
        }), k = 150, x = 480, y = 250, λ = 0, φ = 0, δλ = 0, δφ = 0, δγ = 0, δx, δy, preclip = d3_geo_clipAntimeridian, postclip = d3_identity, clipAngle = null, clipExtent = null, stream;
      function projection(point) {
        point = projectRotate(point[0] * d3_radians, point[1] * d3_radians);
        return [
          point[0] * k + δx,
          δy - point[1] * k
        ];
      }
      function invert(point) {
        point = projectRotate.invert((point[0] - δx) / k, (δy - point[1]) / k);
        return point && [
          point[0] * d3_degrees,
          point[1] * d3_degrees
        ];
      }
      projection.stream = function (output) {
        if (stream)
          stream.valid = false;
        stream = d3_geo_projectionRadians(preclip(rotate, projectResample(postclip(output))));
        stream.valid = true;
        return stream;
      };
      projection.clipAngle = function (_) {
        if (!arguments.length)
          return clipAngle;
        preclip = _ == null ? (clipAngle = _, d3_geo_clipAntimeridian) : d3_geo_clipCircle((clipAngle = +_) * d3_radians);
        return invalidate();
      };
      projection.clipExtent = function (_) {
        if (!arguments.length)
          return clipExtent;
        clipExtent = _;
        postclip = _ ? d3_geo_clipExtent(_[0][0], _[0][1], _[1][0], _[1][1]) : d3_identity;
        return invalidate();
      };
      projection.scale = function (_) {
        if (!arguments.length)
          return k;
        k = +_;
        return reset();
      };
      projection.translate = function (_) {
        if (!arguments.length)
          return [
            x,
            y
          ];
        x = +_[0];
        y = +_[1];
        return reset();
      };
      projection.center = function (_) {
        if (!arguments.length)
          return [
            λ * d3_degrees,
            φ * d3_degrees
          ];
        λ = _[0] % 360 * d3_radians;
        φ = _[1] % 360 * d3_radians;
        return reset();
      };
      projection.rotate = function (_) {
        if (!arguments.length)
          return [
            δλ * d3_degrees,
            δφ * d3_degrees,
            δγ * d3_degrees
          ];
        δλ = _[0] % 360 * d3_radians;
        δφ = _[1] % 360 * d3_radians;
        δγ = _.length > 2 ? _[2] % 360 * d3_radians : 0;
        return reset();
      };
      d3.rebind(projection, projectResample, 'precision');
      function reset() {
        projectRotate = d3_geo_compose(rotate = d3_geo_rotation(δλ, δφ, δγ), project);
        var center = project(λ, φ);
        δx = x - center[0] * k;
        δy = y + center[1] * k;
        return invalidate();
      }
      function invalidate() {
        if (stream)
          stream.valid = false, stream = null;
        return projection;
      }
      return function () {
        project = projectAt.apply(this, arguments);
        projection.invert = project.invert && invert;
        return reset();
      };
    }
    function d3_geo_projectionRadians(stream) {
      var transform = new d3_geo_transform(stream);
      transform.point = function (λ, φ) {
        stream.point(λ * d3_radians, φ * d3_radians);
      };
      return transform;
    }
    function d3_geo_equirectangular(λ, φ) {
      return [
        λ,
        φ
      ];
    }
    (d3.geo.equirectangular = function () {
      return d3_geo_projection(d3_geo_equirectangular);
    }).raw = d3_geo_equirectangular.invert = d3_geo_equirectangular;
    d3.geo.rotation = function (rotate) {
      rotate = d3_geo_rotation(rotate[0] % 360 * d3_radians, rotate[1] * d3_radians, rotate.length > 2 ? rotate[2] * d3_radians : 0);
      function forward(coordinates) {
        coordinates = rotate(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
        return coordinates[0] *= d3_degrees, coordinates[1] *= d3_degrees, coordinates;
      }
      forward.invert = function (coordinates) {
        coordinates = rotate.invert(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
        return coordinates[0] *= d3_degrees, coordinates[1] *= d3_degrees, coordinates;
      };
      return forward;
    };
    function d3_geo_identityRotation(λ, φ) {
      return [
        λ > π ? λ - τ : λ < -π ? λ + τ : λ,
        φ
      ];
    }
    d3_geo_identityRotation.invert = d3_geo_equirectangular;
    function d3_geo_rotation(δλ, δφ, δγ) {
      return δλ ? δφ || δγ ? d3_geo_compose(d3_geo_rotationλ(δλ), d3_geo_rotationφγ(δφ, δγ)) : d3_geo_rotationλ(δλ) : δφ || δγ ? d3_geo_rotationφγ(δφ, δγ) : d3_geo_identityRotation;
    }
    function d3_geo_forwardRotationλ(δλ) {
      return function (λ, φ) {
        return λ += δλ, [
          λ > π ? λ - τ : λ < -π ? λ + τ : λ,
          φ
        ];
      };
    }
    function d3_geo_rotationλ(δλ) {
      var rotation = d3_geo_forwardRotationλ(δλ);
      rotation.invert = d3_geo_forwardRotationλ(-δλ);
      return rotation;
    }
    function d3_geo_rotationφγ(δφ, δγ) {
      var cosδφ = Math.cos(δφ), sinδφ = Math.sin(δφ), cosδγ = Math.cos(δγ), sinδγ = Math.sin(δγ);
      function rotation(λ, φ) {
        var cosφ = Math.cos(φ), x = Math.cos(λ) * cosφ, y = Math.sin(λ) * cosφ, z = Math.sin(φ), k = z * cosδφ + x * sinδφ;
        return [
          Math.atan2(y * cosδγ - k * sinδγ, x * cosδφ - z * sinδφ),
          d3_asin(k * cosδγ + y * sinδγ)
        ];
      }
      rotation.invert = function (λ, φ) {
        var cosφ = Math.cos(φ), x = Math.cos(λ) * cosφ, y = Math.sin(λ) * cosφ, z = Math.sin(φ), k = z * cosδγ - y * sinδγ;
        return [
          Math.atan2(y * cosδγ + z * sinδγ, x * cosδφ + k * sinδφ),
          d3_asin(k * cosδφ - x * sinδφ)
        ];
      };
      return rotation;
    }
    d3.geo.circle = function () {
      var origin = [
          0,
          0
        ], angle, precision = 6, interpolate;
      function circle() {
        var center = typeof origin === 'function' ? origin.apply(this, arguments) : origin, rotate = d3_geo_rotation(-center[0] * d3_radians, -center[1] * d3_radians, 0).invert, ring = [];
        interpolate(null, null, 1, {
          point: function (x, y) {
            ring.push(x = rotate(x, y));
            x[0] *= d3_degrees, x[1] *= d3_degrees;
          }
        });
        return {
          type: 'Polygon',
          coordinates: [ring]
        };
      }
      circle.origin = function (x) {
        if (!arguments.length)
          return origin;
        origin = x;
        return circle;
      };
      circle.angle = function (x) {
        if (!arguments.length)
          return angle;
        interpolate = d3_geo_circleInterpolate((angle = +x) * d3_radians, precision * d3_radians);
        return circle;
      };
      circle.precision = function (_) {
        if (!arguments.length)
          return precision;
        interpolate = d3_geo_circleInterpolate(angle * d3_radians, (precision = +_) * d3_radians);
        return circle;
      };
      return circle.angle(90);
    };
    function d3_geo_circleInterpolate(radius, precision) {
      var cr = Math.cos(radius), sr = Math.sin(radius);
      return function (from, to, direction, listener) {
        var step = direction * precision;
        if (from != null) {
          from = d3_geo_circleAngle(cr, from);
          to = d3_geo_circleAngle(cr, to);
          if (direction > 0 ? from < to : from > to)
            from += direction * τ;
        } else {
          from = radius + direction * τ;
          to = radius - 0.5 * step;
        }
        for (var point, t = from; direction > 0 ? t > to : t < to; t -= step) {
          listener.point((point = d3_geo_spherical([
            cr,
            -sr * Math.cos(t),
            -sr * Math.sin(t)
          ]))[0], point[1]);
        }
      };
    }
    function d3_geo_circleAngle(cr, point) {
      var a = d3_geo_cartesian(point);
      a[0] -= cr;
      d3_geo_cartesianNormalize(a);
      var angle = d3_acos(-a[1]);
      return ((-a[2] < 0 ? -angle : angle) + 2 * Math.PI - ε) % (2 * Math.PI);
    }
    d3.geo.distance = function (a, b) {
      var Δλ = (b[0] - a[0]) * d3_radians, φ0 = a[1] * d3_radians, φ1 = b[1] * d3_radians, sinΔλ = Math.sin(Δλ), cosΔλ = Math.cos(Δλ), sinφ0 = Math.sin(φ0), cosφ0 = Math.cos(φ0), sinφ1 = Math.sin(φ1), cosφ1 = Math.cos(φ1), t;
      return Math.atan2(Math.sqrt((t = cosφ1 * sinΔλ) * t + (t = cosφ0 * sinφ1 - sinφ0 * cosφ1 * cosΔλ) * t), sinφ0 * sinφ1 + cosφ0 * cosφ1 * cosΔλ);
    };
    d3.geo.graticule = function () {
      var x1, x0, X1, X0, y1, y0, Y1, Y0, dx = 10, dy = dx, DX = 90, DY = 360, x, y, X, Y, precision = 2.5;
      function graticule() {
        return {
          type: 'MultiLineString',
          coordinates: lines()
        };
      }
      function lines() {
        return d3.range(Math.ceil(X0 / DX) * DX, X1, DX).map(X).concat(d3.range(Math.ceil(Y0 / DY) * DY, Y1, DY).map(Y)).concat(d3.range(Math.ceil(x0 / dx) * dx, x1, dx).filter(function (x) {
          return Math.abs(x % DX) > ε;
        }).map(x)).concat(d3.range(Math.ceil(y0 / dy) * dy, y1, dy).filter(function (y) {
          return Math.abs(y % DY) > ε;
        }).map(y));
      }
      graticule.lines = function () {
        return lines().map(function (coordinates) {
          return {
            type: 'LineString',
            coordinates: coordinates
          };
        });
      };
      graticule.outline = function () {
        return {
          type: 'Polygon',
          coordinates: [X(X0).concat(Y(Y1).slice(1), X(X1).reverse().slice(1), Y(Y0).reverse().slice(1))]
        };
      };
      graticule.extent = function (_) {
        if (!arguments.length)
          return graticule.minorExtent();
        return graticule.majorExtent(_).minorExtent(_);
      };
      graticule.majorExtent = function (_) {
        if (!arguments.length)
          return [
            [
              X0,
              Y0
            ],
            [
              X1,
              Y1
            ]
          ];
        X0 = +_[0][0], X1 = +_[1][0];
        Y0 = +_[0][1], Y1 = +_[1][1];
        if (X0 > X1)
          _ = X0, X0 = X1, X1 = _;
        if (Y0 > Y1)
          _ = Y0, Y0 = Y1, Y1 = _;
        return graticule.precision(precision);
      };
      graticule.minorExtent = function (_) {
        if (!arguments.length)
          return [
            [
              x0,
              y0
            ],
            [
              x1,
              y1
            ]
          ];
        x0 = +_[0][0], x1 = +_[1][0];
        y0 = +_[0][1], y1 = +_[1][1];
        if (x0 > x1)
          _ = x0, x0 = x1, x1 = _;
        if (y0 > y1)
          _ = y0, y0 = y1, y1 = _;
        return graticule.precision(precision);
      };
      graticule.step = function (_) {
        if (!arguments.length)
          return graticule.minorStep();
        return graticule.majorStep(_).minorStep(_);
      };
      graticule.majorStep = function (_) {
        if (!arguments.length)
          return [
            DX,
            DY
          ];
        DX = +_[0], DY = +_[1];
        return graticule;
      };
      graticule.minorStep = function (_) {
        if (!arguments.length)
          return [
            dx,
            dy
          ];
        dx = +_[0], dy = +_[1];
        return graticule;
      };
      graticule.precision = function (_) {
        if (!arguments.length)
          return precision;
        precision = +_;
        x = d3_geo_graticuleX(y0, y1, 90);
        y = d3_geo_graticuleY(x0, x1, precision);
        X = d3_geo_graticuleX(Y0, Y1, 90);
        Y = d3_geo_graticuleY(X0, X1, precision);
        return graticule;
      };
      return graticule.majorExtent([
        [
          -180,
          -90 + ε
        ],
        [
          180,
          90 - ε
        ]
      ]).minorExtent([
        [
          -180,
          -80 - ε
        ],
        [
          180,
          80 + ε
        ]
      ]);
    };
    function d3_geo_graticuleX(y0, y1, dy) {
      var y = d3.range(y0, y1 - ε, dy).concat(y1);
      return function (x) {
        return y.map(function (y) {
          return [
            x,
            y
          ];
        });
      };
    }
    function d3_geo_graticuleY(x0, x1, dx) {
      var x = d3.range(x0, x1 - ε, dx).concat(x1);
      return function (y) {
        return x.map(function (x) {
          return [
            x,
            y
          ];
        });
      };
    }
    function d3_source(d) {
      return d.source;
    }
    function d3_target(d) {
      return d.target;
    }
    d3.geo.greatArc = function () {
      var source = d3_source, source_, target = d3_target, target_;
      function greatArc() {
        return {
          type: 'LineString',
          coordinates: [
            source_ || source.apply(this, arguments),
            target_ || target.apply(this, arguments)
          ]
        };
      }
      greatArc.distance = function () {
        return d3.geo.distance(source_ || source.apply(this, arguments), target_ || target.apply(this, arguments));
      };
      greatArc.source = function (_) {
        if (!arguments.length)
          return source;
        source = _, source_ = typeof _ === 'function' ? null : _;
        return greatArc;
      };
      greatArc.target = function (_) {
        if (!arguments.length)
          return target;
        target = _, target_ = typeof _ === 'function' ? null : _;
        return greatArc;
      };
      greatArc.precision = function () {
        return arguments.length ? greatArc : 0;
      };
      return greatArc;
    };
    d3.geo.interpolate = function (source, target) {
      return d3_geo_interpolate(source[0] * d3_radians, source[1] * d3_radians, target[0] * d3_radians, target[1] * d3_radians);
    };
    function d3_geo_interpolate(x0, y0, x1, y1) {
      var cy0 = Math.cos(y0), sy0 = Math.sin(y0), cy1 = Math.cos(y1), sy1 = Math.sin(y1), kx0 = cy0 * Math.cos(x0), ky0 = cy0 * Math.sin(x0), kx1 = cy1 * Math.cos(x1), ky1 = cy1 * Math.sin(x1), d = 2 * Math.asin(Math.sqrt(d3_haversin(y1 - y0) + cy0 * cy1 * d3_haversin(x1 - x0))), k = 1 / Math.sin(d);
      var interpolate = d ? function (t) {
          var B = Math.sin(t *= d) * k, A = Math.sin(d - t) * k, x = A * kx0 + B * kx1, y = A * ky0 + B * ky1, z = A * sy0 + B * sy1;
          return [
            Math.atan2(y, x) * d3_degrees,
            Math.atan2(z, Math.sqrt(x * x + y * y)) * d3_degrees
          ];
        } : function () {
          return [
            x0 * d3_degrees,
            y0 * d3_degrees
          ];
        };
      interpolate.distance = d;
      return interpolate;
    }
    d3.geo.length = function (object) {
      d3_geo_lengthSum = 0;
      d3.geo.stream(object, d3_geo_length);
      return d3_geo_lengthSum;
    };
    var d3_geo_lengthSum;
    var d3_geo_length = {
        sphere: d3_noop,
        point: d3_noop,
        lineStart: d3_geo_lengthLineStart,
        lineEnd: d3_noop,
        polygonStart: d3_noop,
        polygonEnd: d3_noop
      };
    function d3_geo_lengthLineStart() {
      var λ0, sinφ0, cosφ0;
      d3_geo_length.point = function (λ, φ) {
        λ0 = λ * d3_radians, sinφ0 = Math.sin(φ *= d3_radians), cosφ0 = Math.cos(φ);
        d3_geo_length.point = nextPoint;
      };
      d3_geo_length.lineEnd = function () {
        d3_geo_length.point = d3_geo_length.lineEnd = d3_noop;
      };
      function nextPoint(λ, φ) {
        var sinφ = Math.sin(φ *= d3_radians), cosφ = Math.cos(φ), t = Math.abs((λ *= d3_radians) - λ0), cosΔλ = Math.cos(t);
        d3_geo_lengthSum += Math.atan2(Math.sqrt((t = cosφ * Math.sin(t)) * t + (t = cosφ0 * sinφ - sinφ0 * cosφ * cosΔλ) * t), sinφ0 * sinφ + cosφ0 * cosφ * cosΔλ);
        λ0 = λ, sinφ0 = sinφ, cosφ0 = cosφ;
      }
    }
    function d3_geo_azimuthal(scale, angle) {
      function azimuthal(λ, φ) {
        var cosλ = Math.cos(λ), cosφ = Math.cos(φ), k = scale(cosλ * cosφ);
        return [
          k * cosφ * Math.sin(λ),
          k * Math.sin(φ)
        ];
      }
      azimuthal.invert = function (x, y) {
        var ρ = Math.sqrt(x * x + y * y), c = angle(ρ), sinc = Math.sin(c), cosc = Math.cos(c);
        return [
          Math.atan2(x * sinc, ρ * cosc),
          Math.asin(ρ && y * sinc / ρ)
        ];
      };
      return azimuthal;
    }
    var d3_geo_azimuthalEqualArea = d3_geo_azimuthal(function (cosλcosφ) {
        return Math.sqrt(2 / (1 + cosλcosφ));
      }, function (ρ) {
        return 2 * Math.asin(ρ / 2);
      });
    (d3.geo.azimuthalEqualArea = function () {
      return d3_geo_projection(d3_geo_azimuthalEqualArea);
    }).raw = d3_geo_azimuthalEqualArea;
    var d3_geo_azimuthalEquidistant = d3_geo_azimuthal(function (cosλcosφ) {
        var c = Math.acos(cosλcosφ);
        return c && c / Math.sin(c);
      }, d3_identity);
    (d3.geo.azimuthalEquidistant = function () {
      return d3_geo_projection(d3_geo_azimuthalEquidistant);
    }).raw = d3_geo_azimuthalEquidistant;
    function d3_geo_conicConformal(φ0, φ1) {
      var cosφ0 = Math.cos(φ0), t = function (φ) {
          return Math.tan(π / 4 + φ / 2);
        }, n = φ0 === φ1 ? Math.sin(φ0) : Math.log(cosφ0 / Math.cos(φ1)) / Math.log(t(φ1) / t(φ0)), F = cosφ0 * Math.pow(t(φ0), n) / n;
      if (!n)
        return d3_geo_mercator;
      function forward(λ, φ) {
        var ρ = Math.abs(Math.abs(φ) - halfπ) < ε ? 0 : F / Math.pow(t(φ), n);
        return [
          ρ * Math.sin(n * λ),
          F - ρ * Math.cos(n * λ)
        ];
      }
      forward.invert = function (x, y) {
        var ρ0_y = F - y, ρ = d3_sgn(n) * Math.sqrt(x * x + ρ0_y * ρ0_y);
        return [
          Math.atan2(x, ρ0_y) / n,
          2 * Math.atan(Math.pow(F / ρ, 1 / n)) - halfπ
        ];
      };
      return forward;
    }
    (d3.geo.conicConformal = function () {
      return d3_geo_conic(d3_geo_conicConformal);
    }).raw = d3_geo_conicConformal;
    function d3_geo_conicEquidistant(φ0, φ1) {
      var cosφ0 = Math.cos(φ0), n = φ0 === φ1 ? Math.sin(φ0) : (cosφ0 - Math.cos(φ1)) / (φ1 - φ0), G = cosφ0 / n + φ0;
      if (Math.abs(n) < ε)
        return d3_geo_equirectangular;
      function forward(λ, φ) {
        var ρ = G - φ;
        return [
          ρ * Math.sin(n * λ),
          G - ρ * Math.cos(n * λ)
        ];
      }
      forward.invert = function (x, y) {
        var ρ0_y = G - y;
        return [
          Math.atan2(x, ρ0_y) / n,
          G - d3_sgn(n) * Math.sqrt(x * x + ρ0_y * ρ0_y)
        ];
      };
      return forward;
    }
    (d3.geo.conicEquidistant = function () {
      return d3_geo_conic(d3_geo_conicEquidistant);
    }).raw = d3_geo_conicEquidistant;
    var d3_geo_gnomonic = d3_geo_azimuthal(function (cosλcosφ) {
        return 1 / cosλcosφ;
      }, Math.atan);
    (d3.geo.gnomonic = function () {
      return d3_geo_projection(d3_geo_gnomonic);
    }).raw = d3_geo_gnomonic;
    function d3_geo_mercator(λ, φ) {
      return [
        λ,
        Math.log(Math.tan(π / 4 + φ / 2))
      ];
    }
    d3_geo_mercator.invert = function (x, y) {
      return [
        x,
        2 * Math.atan(Math.exp(y)) - halfπ
      ];
    };
    function d3_geo_mercatorProjection(project) {
      var m = d3_geo_projection(project), scale = m.scale, translate = m.translate, clipExtent = m.clipExtent, clipAuto;
      m.scale = function () {
        var v = scale.apply(m, arguments);
        return v === m ? clipAuto ? m.clipExtent(null) : m : v;
      };
      m.translate = function () {
        var v = translate.apply(m, arguments);
        return v === m ? clipAuto ? m.clipExtent(null) : m : v;
      };
      m.clipExtent = function (_) {
        var v = clipExtent.apply(m, arguments);
        if (v === m) {
          if (clipAuto = _ == null) {
            var k = π * scale(), t = translate();
            clipExtent([
              [
                t[0] - k,
                t[1] - k
              ],
              [
                t[0] + k,
                t[1] + k
              ]
            ]);
          }
        } else if (clipAuto) {
          v = null;
        }
        return v;
      };
      return m.clipExtent(null);
    }
    (d3.geo.mercator = function () {
      return d3_geo_mercatorProjection(d3_geo_mercator);
    }).raw = d3_geo_mercator;
    var d3_geo_orthographic = d3_geo_azimuthal(function () {
        return 1;
      }, Math.asin);
    (d3.geo.orthographic = function () {
      return d3_geo_projection(d3_geo_orthographic);
    }).raw = d3_geo_orthographic;
    var d3_geo_stereographic = d3_geo_azimuthal(function (cosλcosφ) {
        return 1 / (1 + cosλcosφ);
      }, function (ρ) {
        return 2 * Math.atan(ρ);
      });
    (d3.geo.stereographic = function () {
      return d3_geo_projection(d3_geo_stereographic);
    }).raw = d3_geo_stereographic;
    function d3_geo_transverseMercator(λ, φ) {
      var B = Math.cos(φ) * Math.sin(λ);
      return [
        Math.log((1 + B) / (1 - B)) / 2,
        Math.atan2(Math.tan(φ), Math.cos(λ))
      ];
    }
    d3_geo_transverseMercator.invert = function (x, y) {
      return [
        Math.atan2(d3_sinh(x), Math.cos(y)),
        d3_asin(Math.sin(y) / d3_cosh(x))
      ];
    };
    (d3.geo.transverseMercator = function () {
      return d3_geo_mercatorProjection(d3_geo_transverseMercator);
    }).raw = d3_geo_transverseMercator;
    d3.geom = {};
    d3.svg = {};
    function d3_svg_line(projection) {
      var x = d3_svg_lineX, y = d3_svg_lineY, defined = d3_true, interpolate = d3_svg_lineLinear, interpolateKey = interpolate.key, tension = 0.7;
      function line(data) {
        var segments = [], points = [], i = -1, n = data.length, d, fx = d3_functor(x), fy = d3_functor(y);
        function segment() {
          segments.push('M', interpolate(projection(points), tension));
        }
        while (++i < n) {
          if (defined.call(this, d = data[i], i)) {
            points.push([
              +fx.call(this, d, i),
              +fy.call(this, d, i)
            ]);
          } else if (points.length) {
            segment();
            points = [];
          }
        }
        if (points.length)
          segment();
        return segments.length ? segments.join('') : null;
      }
      line.x = function (_) {
        if (!arguments.length)
          return x;
        x = _;
        return line;
      };
      line.y = function (_) {
        if (!arguments.length)
          return y;
        y = _;
        return line;
      };
      line.defined = function (_) {
        if (!arguments.length)
          return defined;
        defined = _;
        return line;
      };
      line.interpolate = function (_) {
        if (!arguments.length)
          return interpolateKey;
        if (typeof _ === 'function')
          interpolateKey = interpolate = _;
        else
          interpolateKey = (interpolate = d3_svg_lineInterpolators.get(_) || d3_svg_lineLinear).key;
        return line;
      };
      line.tension = function (_) {
        if (!arguments.length)
          return tension;
        tension = _;
        return line;
      };
      return line;
    }
    d3.svg.line = function () {
      return d3_svg_line(d3_identity);
    };
    function d3_svg_lineX(d) {
      return d[0];
    }
    function d3_svg_lineY(d) {
      return d[1];
    }
    var d3_svg_lineInterpolators = d3.map({
        linear: d3_svg_lineLinear,
        'linear-closed': d3_svg_lineLinearClosed,
        step: d3_svg_lineStep,
        'step-before': d3_svg_lineStepBefore,
        'step-after': d3_svg_lineStepAfter,
        basis: d3_svg_lineBasis,
        'basis-open': d3_svg_lineBasisOpen,
        'basis-closed': d3_svg_lineBasisClosed,
        bundle: d3_svg_lineBundle,
        cardinal: d3_svg_lineCardinal,
        'cardinal-open': d3_svg_lineCardinalOpen,
        'cardinal-closed': d3_svg_lineCardinalClosed,
        monotone: d3_svg_lineMonotone
      });
    d3_svg_lineInterpolators.forEach(function (key, value) {
      value.key = key;
      value.closed = /-closed$/.test(key);
    });
    function d3_svg_lineLinear(points) {
      return points.join('L');
    }
    function d3_svg_lineLinearClosed(points) {
      return d3_svg_lineLinear(points) + 'Z';
    }
    function d3_svg_lineStep(points) {
      var i = 0, n = points.length, p = points[0], path = [
          p[0],
          ',',
          p[1]
        ];
      while (++i < n)
        path.push('H', (p[0] + (p = points[i])[0]) / 2, 'V', p[1]);
      if (n > 1)
        path.push('H', p[0]);
      return path.join('');
    }
    function d3_svg_lineStepBefore(points) {
      var i = 0, n = points.length, p = points[0], path = [
          p[0],
          ',',
          p[1]
        ];
      while (++i < n)
        path.push('V', (p = points[i])[1], 'H', p[0]);
      return path.join('');
    }
    function d3_svg_lineStepAfter(points) {
      var i = 0, n = points.length, p = points[0], path = [
          p[0],
          ',',
          p[1]
        ];
      while (++i < n)
        path.push('H', (p = points[i])[0], 'V', p[1]);
      return path.join('');
    }
    function d3_svg_lineCardinalOpen(points, tension) {
      return points.length < 4 ? d3_svg_lineLinear(points) : points[1] + d3_svg_lineHermite(points.slice(1, points.length - 1), d3_svg_lineCardinalTangents(points, tension));
    }
    function d3_svg_lineCardinalClosed(points, tension) {
      return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite((points.push(points[0]), points), d3_svg_lineCardinalTangents([points[points.length - 2]].concat(points, [points[1]]), tension));
    }
    function d3_svg_lineCardinal(points, tension) {
      return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite(points, d3_svg_lineCardinalTangents(points, tension));
    }
    function d3_svg_lineHermite(points, tangents) {
      if (tangents.length < 1 || points.length != tangents.length && points.length != tangents.length + 2) {
        return d3_svg_lineLinear(points);
      }
      var quad = points.length != tangents.length, path = '', p0 = points[0], p = points[1], t0 = tangents[0], t = t0, pi = 1;
      if (quad) {
        path += 'Q' + (p[0] - t0[0] * 2 / 3) + ',' + (p[1] - t0[1] * 2 / 3) + ',' + p[0] + ',' + p[1];
        p0 = points[1];
        pi = 2;
      }
      if (tangents.length > 1) {
        t = tangents[1];
        p = points[pi];
        pi++;
        path += 'C' + (p0[0] + t0[0]) + ',' + (p0[1] + t0[1]) + ',' + (p[0] - t[0]) + ',' + (p[1] - t[1]) + ',' + p[0] + ',' + p[1];
        for (var i = 2; i < tangents.length; i++, pi++) {
          p = points[pi];
          t = tangents[i];
          path += 'S' + (p[0] - t[0]) + ',' + (p[1] - t[1]) + ',' + p[0] + ',' + p[1];
        }
      }
      if (quad) {
        var lp = points[pi];
        path += 'Q' + (p[0] + t[0] * 2 / 3) + ',' + (p[1] + t[1] * 2 / 3) + ',' + lp[0] + ',' + lp[1];
      }
      return path;
    }
    function d3_svg_lineCardinalTangents(points, tension) {
      var tangents = [], a = (1 - tension) / 2, p0, p1 = points[0], p2 = points[1], i = 1, n = points.length;
      while (++i < n) {
        p0 = p1;
        p1 = p2;
        p2 = points[i];
        tangents.push([
          a * (p2[0] - p0[0]),
          a * (p2[1] - p0[1])
        ]);
      }
      return tangents;
    }
    function d3_svg_lineBasis(points) {
      if (points.length < 3)
        return d3_svg_lineLinear(points);
      var i = 1, n = points.length, pi = points[0], x0 = pi[0], y0 = pi[1], px = [
          x0,
          x0,
          x0,
          (pi = points[1])[0]
        ], py = [
          y0,
          y0,
          y0,
          pi[1]
        ], path = [
          x0,
          ',',
          y0,
          'L',
          d3_svg_lineDot4(d3_svg_lineBasisBezier3, px),
          ',',
          d3_svg_lineDot4(d3_svg_lineBasisBezier3, py)
        ];
      points.push(points[n - 1]);
      while (++i <= n) {
        pi = points[i];
        px.shift();
        px.push(pi[0]);
        py.shift();
        py.push(pi[1]);
        d3_svg_lineBasisBezier(path, px, py);
      }
      points.pop();
      path.push('L', pi);
      return path.join('');
    }
    function d3_svg_lineBasisOpen(points) {
      if (points.length < 4)
        return d3_svg_lineLinear(points);
      var path = [], i = -1, n = points.length, pi, px = [0], py = [0];
      while (++i < 3) {
        pi = points[i];
        px.push(pi[0]);
        py.push(pi[1]);
      }
      path.push(d3_svg_lineDot4(d3_svg_lineBasisBezier3, px) + ',' + d3_svg_lineDot4(d3_svg_lineBasisBezier3, py));
      --i;
      while (++i < n) {
        pi = points[i];
        px.shift();
        px.push(pi[0]);
        py.shift();
        py.push(pi[1]);
        d3_svg_lineBasisBezier(path, px, py);
      }
      return path.join('');
    }
    function d3_svg_lineBasisClosed(points) {
      var path, i = -1, n = points.length, m = n + 4, pi, px = [], py = [];
      while (++i < 4) {
        pi = points[i % n];
        px.push(pi[0]);
        py.push(pi[1]);
      }
      path = [
        d3_svg_lineDot4(d3_svg_lineBasisBezier3, px),
        ',',
        d3_svg_lineDot4(d3_svg_lineBasisBezier3, py)
      ];
      --i;
      while (++i < m) {
        pi = points[i % n];
        px.shift();
        px.push(pi[0]);
        py.shift();
        py.push(pi[1]);
        d3_svg_lineBasisBezier(path, px, py);
      }
      return path.join('');
    }
    function d3_svg_lineBundle(points, tension) {
      var n = points.length - 1;
      if (n) {
        var x0 = points[0][0], y0 = points[0][1], dx = points[n][0] - x0, dy = points[n][1] - y0, i = -1, p, t;
        while (++i <= n) {
          p = points[i];
          t = i / n;
          p[0] = tension * p[0] + (1 - tension) * (x0 + t * dx);
          p[1] = tension * p[1] + (1 - tension) * (y0 + t * dy);
        }
      }
      return d3_svg_lineBasis(points);
    }
    function d3_svg_lineDot4(a, b) {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
    }
    var d3_svg_lineBasisBezier1 = [
        0,
        2 / 3,
        1 / 3,
        0
      ], d3_svg_lineBasisBezier2 = [
        0,
        1 / 3,
        2 / 3,
        0
      ], d3_svg_lineBasisBezier3 = [
        0,
        1 / 6,
        2 / 3,
        1 / 6
      ];
    function d3_svg_lineBasisBezier(path, x, y) {
      path.push('C', d3_svg_lineDot4(d3_svg_lineBasisBezier1, x), ',', d3_svg_lineDot4(d3_svg_lineBasisBezier1, y), ',', d3_svg_lineDot4(d3_svg_lineBasisBezier2, x), ',', d3_svg_lineDot4(d3_svg_lineBasisBezier2, y), ',', d3_svg_lineDot4(d3_svg_lineBasisBezier3, x), ',', d3_svg_lineDot4(d3_svg_lineBasisBezier3, y));
    }
    function d3_svg_lineSlope(p0, p1) {
      return (p1[1] - p0[1]) / (p1[0] - p0[0]);
    }
    function d3_svg_lineFiniteDifferences(points) {
      var i = 0, j = points.length - 1, m = [], p0 = points[0], p1 = points[1], d = m[0] = d3_svg_lineSlope(p0, p1);
      while (++i < j) {
        m[i] = (d + (d = d3_svg_lineSlope(p0 = p1, p1 = points[i + 1]))) / 2;
      }
      m[i] = d;
      return m;
    }
    function d3_svg_lineMonotoneTangents(points) {
      var tangents = [], d, a, b, s, m = d3_svg_lineFiniteDifferences(points), i = -1, j = points.length - 1;
      while (++i < j) {
        d = d3_svg_lineSlope(points[i], points[i + 1]);
        if (Math.abs(d) < ε) {
          m[i] = m[i + 1] = 0;
        } else {
          a = m[i] / d;
          b = m[i + 1] / d;
          s = a * a + b * b;
          if (s > 9) {
            s = d * 3 / Math.sqrt(s);
            m[i] = s * a;
            m[i + 1] = s * b;
          }
        }
      }
      i = -1;
      while (++i <= j) {
        s = (points[Math.min(j, i + 1)][0] - points[Math.max(0, i - 1)][0]) / (6 * (1 + m[i] * m[i]));
        tangents.push([
          s || 0,
          m[i] * s || 0
        ]);
      }
      return tangents;
    }
    function d3_svg_lineMonotone(points) {
      return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite(points, d3_svg_lineMonotoneTangents(points));
    }
    d3.geom.hull = function (vertices) {
      var x = d3_svg_lineX, y = d3_svg_lineY;
      if (arguments.length)
        return hull(vertices);
      function hull(data) {
        if (data.length < 3)
          return [];
        var fx = d3_functor(x), fy = d3_functor(y), n = data.length, vertices, plen = n - 1, points = [], stack = [], d, i, j, h = 0, x1, y1, x2, y2, u, v, a, sp;
        if (fx === d3_svg_lineX && y === d3_svg_lineY)
          vertices = data;
        else
          for (i = 0, vertices = []; i < n; ++i) {
            vertices.push([
              +fx.call(this, d = data[i], i),
              +fy.call(this, d, i)
            ]);
          }
        for (i = 1; i < n; ++i) {
          if (vertices[i][1] < vertices[h][1] || vertices[i][1] == vertices[h][1] && vertices[i][0] < vertices[h][0])
            h = i;
        }
        for (i = 0; i < n; ++i) {
          if (i === h)
            continue;
          y1 = vertices[i][1] - vertices[h][1];
          x1 = vertices[i][0] - vertices[h][0];
          points.push({
            angle: Math.atan2(y1, x1),
            index: i
          });
        }
        points.sort(function (a, b) {
          return a.angle - b.angle;
        });
        a = points[0].angle;
        v = points[0].index;
        u = 0;
        for (i = 1; i < plen; ++i) {
          j = points[i].index;
          if (a == points[i].angle) {
            x1 = vertices[v][0] - vertices[h][0];
            y1 = vertices[v][1] - vertices[h][1];
            x2 = vertices[j][0] - vertices[h][0];
            y2 = vertices[j][1] - vertices[h][1];
            if (x1 * x1 + y1 * y1 >= x2 * x2 + y2 * y2) {
              points[i].index = -1;
              continue;
            } else {
              points[u].index = -1;
            }
          }
          a = points[i].angle;
          u = i;
          v = j;
        }
        stack.push(h);
        for (i = 0, j = 0; i < 2; ++j) {
          if (points[j].index > -1) {
            stack.push(points[j].index);
            i++;
          }
        }
        sp = stack.length;
        for (; j < plen; ++j) {
          if (points[j].index < 0)
            continue;
          while (!d3_geom_hullCCW(stack[sp - 2], stack[sp - 1], points[j].index, vertices)) {
            --sp;
          }
          stack[sp++] = points[j].index;
        }
        var poly = [];
        for (i = sp - 1; i >= 0; --i)
          poly.push(data[stack[i]]);
        return poly;
      }
      hull.x = function (_) {
        return arguments.length ? (x = _, hull) : x;
      };
      hull.y = function (_) {
        return arguments.length ? (y = _, hull) : y;
      };
      return hull;
    };
    function d3_geom_hullCCW(i1, i2, i3, v) {
      var t, a, b, c, d, e, f;
      t = v[i1];
      a = t[0];
      b = t[1];
      t = v[i2];
      c = t[0];
      d = t[1];
      t = v[i3];
      e = t[0];
      f = t[1];
      return (f - b) * (c - a) - (d - b) * (e - a) > 0;
    }
    d3.geom.polygon = function (coordinates) {
      d3_subclass(coordinates, d3_geom_polygonPrototype);
      return coordinates;
    };
    var d3_geom_polygonPrototype = d3.geom.polygon.prototype = [];
    d3_geom_polygonPrototype.area = function () {
      var i = -1, n = this.length, a, b = this[n - 1], area = 0;
      while (++i < n) {
        a = b;
        b = this[i];
        area += a[1] * b[0] - a[0] * b[1];
      }
      return area * 0.5;
    };
    d3_geom_polygonPrototype.centroid = function (k) {
      var i = -1, n = this.length, x = 0, y = 0, a, b = this[n - 1], c;
      if (!arguments.length)
        k = -1 / (6 * this.area());
      while (++i < n) {
        a = b;
        b = this[i];
        c = a[0] * b[1] - b[0] * a[1];
        x += (a[0] + b[0]) * c;
        y += (a[1] + b[1]) * c;
      }
      return [
        x * k,
        y * k
      ];
    };
    d3_geom_polygonPrototype.clip = function (subject) {
      var input, closed = d3_geom_polygonClosed(subject), i = -1, n = this.length - d3_geom_polygonClosed(this), j, m, a = this[n - 1], b, c, d;
      while (++i < n) {
        input = subject.slice();
        subject.length = 0;
        b = this[i];
        c = input[(m = input.length - closed) - 1];
        j = -1;
        while (++j < m) {
          d = input[j];
          if (d3_geom_polygonInside(d, a, b)) {
            if (!d3_geom_polygonInside(c, a, b)) {
              subject.push(d3_geom_polygonIntersect(c, d, a, b));
            }
            subject.push(d);
          } else if (d3_geom_polygonInside(c, a, b)) {
            subject.push(d3_geom_polygonIntersect(c, d, a, b));
          }
          c = d;
        }
        if (closed)
          subject.push(subject[0]);
        a = b;
      }
      return subject;
    };
    function d3_geom_polygonInside(p, a, b) {
      return (b[0] - a[0]) * (p[1] - a[1]) < (b[1] - a[1]) * (p[0] - a[0]);
    }
    function d3_geom_polygonIntersect(c, d, a, b) {
      var x1 = c[0], x3 = a[0], x21 = d[0] - x1, x43 = b[0] - x3, y1 = c[1], y3 = a[1], y21 = d[1] - y1, y43 = b[1] - y3, ua = (x43 * (y1 - y3) - y43 * (x1 - x3)) / (y43 * x21 - x43 * y21);
      return [
        x1 + ua * x21,
        y1 + ua * y21
      ];
    }
    function d3_geom_polygonClosed(coordinates) {
      var a = coordinates[0], b = coordinates[coordinates.length - 1];
      return !(a[0] - b[0] || a[1] - b[1]);
    }
    d3.geom.delaunay = function (vertices) {
      var edges = vertices.map(function () {
          return [];
        }), triangles = [];
      d3_geom_voronoiTessellate(vertices, function (e) {
        edges[e.region.l.index].push(vertices[e.region.r.index]);
      });
      edges.forEach(function (edge, i) {
        var v = vertices[i], cx = v[0], cy = v[1];
        edge.forEach(function (v) {
          v.angle = Math.atan2(v[0] - cx, v[1] - cy);
        });
        edge.sort(function (a, b) {
          return a.angle - b.angle;
        });
        for (var j = 0, m = edge.length - 1; j < m; j++) {
          triangles.push([
            v,
            edge[j],
            edge[j + 1]
          ]);
        }
      });
      return triangles;
    };
    d3.geom.voronoi = function (points) {
      var x = d3_svg_lineX, y = d3_svg_lineY, clipPolygon = null;
      if (arguments.length)
        return voronoi(points);
      function voronoi(data) {
        var points, polygons = data.map(function () {
            return [];
          }), fx = d3_functor(x), fy = d3_functor(y), d, i, n = data.length, Z = 1000000;
        if (fx === d3_svg_lineX && fy === d3_svg_lineY)
          points = data;
        else
          for (points = new Array(n), i = 0; i < n; ++i) {
            points[i] = [
              +fx.call(this, d = data[i], i),
              +fy.call(this, d, i)
            ];
          }
        d3_geom_voronoiTessellate(points, function (e) {
          var s1, s2, x1, x2, y1, y2;
          if (e.a === 1 && e.b >= 0) {
            s1 = e.ep.r;
            s2 = e.ep.l;
          } else {
            s1 = e.ep.l;
            s2 = e.ep.r;
          }
          if (e.a === 1) {
            y1 = s1 ? s1.y : -Z;
            x1 = e.c - e.b * y1;
            y2 = s2 ? s2.y : Z;
            x2 = e.c - e.b * y2;
          } else {
            x1 = s1 ? s1.x : -Z;
            y1 = e.c - e.a * x1;
            x2 = s2 ? s2.x : Z;
            y2 = e.c - e.a * x2;
          }
          var v1 = [
              x1,
              y1
            ], v2 = [
              x2,
              y2
            ];
          polygons[e.region.l.index].push(v1, v2);
          polygons[e.region.r.index].push(v1, v2);
        });
        polygons = polygons.map(function (polygon, i) {
          var cx = points[i][0], cy = points[i][1], angle = polygon.map(function (v) {
              return Math.atan2(v[0] - cx, v[1] - cy);
            }), order = d3.range(polygon.length).sort(function (a, b) {
              return angle[a] - angle[b];
            });
          return order.filter(function (d, i) {
            return !i || angle[d] - angle[order[i - 1]] > ε;
          }).map(function (d) {
            return polygon[d];
          });
        });
        polygons.forEach(function (polygon, i) {
          var n = polygon.length;
          if (!n)
            return polygon.push([
              -Z,
              -Z
            ], [
              -Z,
              Z
            ], [
              Z,
              Z
            ], [
              Z,
              -Z
            ]);
          if (n > 2)
            return;
          var p0 = points[i], p1 = polygon[0], p2 = polygon[1], x0 = p0[0], y0 = p0[1], x1 = p1[0], y1 = p1[1], x2 = p2[0], y2 = p2[1], dx = Math.abs(x2 - x1), dy = y2 - y1;
          if (Math.abs(dy) < ε) {
            var y = y0 < y1 ? -Z : Z;
            polygon.push([
              -Z,
              y
            ], [
              Z,
              y
            ]);
          } else if (dx < ε) {
            var x = x0 < x1 ? -Z : Z;
            polygon.push([
              x,
              -Z
            ], [
              x,
              Z
            ]);
          } else {
            var y = (x2 - x1) * (y1 - y0) < (x1 - x0) * (y2 - y1) ? Z : -Z, z = Math.abs(dy) - dx;
            if (Math.abs(z) < ε) {
              polygon.push([
                dy < 0 ? y : -y,
                y
              ]);
            } else {
              if (z > 0)
                y *= -1;
              polygon.push([
                -Z,
                y
              ], [
                Z,
                y
              ]);
            }
          }
        });
        if (clipPolygon)
          for (i = 0; i < n; ++i)
            clipPolygon.clip(polygons[i]);
        for (i = 0; i < n; ++i)
          polygons[i].point = data[i];
        return polygons;
      }
      voronoi.x = function (_) {
        return arguments.length ? (x = _, voronoi) : x;
      };
      voronoi.y = function (_) {
        return arguments.length ? (y = _, voronoi) : y;
      };
      voronoi.clipExtent = function (_) {
        if (!arguments.length)
          return clipPolygon && [
            clipPolygon[0],
            clipPolygon[2]
          ];
        if (_ == null)
          clipPolygon = null;
        else {
          var x1 = +_[0][0], y1 = +_[0][1], x2 = +_[1][0], y2 = +_[1][1];
          clipPolygon = d3.geom.polygon([
            [
              x1,
              y1
            ],
            [
              x1,
              y2
            ],
            [
              x2,
              y2
            ],
            [
              x2,
              y1
            ]
          ]);
        }
        return voronoi;
      };
      voronoi.size = function (_) {
        if (!arguments.length)
          return clipPolygon && clipPolygon[2];
        return voronoi.clipExtent(_ && [
          [
            0,
            0
          ],
          _
        ]);
      };
      voronoi.links = function (data) {
        var points, graph = data.map(function () {
            return [];
          }), links = [], fx = d3_functor(x), fy = d3_functor(y), d, i, n = data.length;
        if (fx === d3_svg_lineX && fy === d3_svg_lineY)
          points = data;
        else
          for (points = new Array(n), i = 0; i < n; ++i) {
            points[i] = [
              +fx.call(this, d = data[i], i),
              +fy.call(this, d, i)
            ];
          }
        d3_geom_voronoiTessellate(points, function (e) {
          var l = e.region.l.index, r = e.region.r.index;
          if (graph[l][r])
            return;
          graph[l][r] = graph[r][l] = true;
          links.push({
            source: data[l],
            target: data[r]
          });
        });
        return links;
      };
      voronoi.triangles = function (data) {
        if (x === d3_svg_lineX && y === d3_svg_lineY)
          return d3.geom.delaunay(data);
        var points = new Array(n), fx = d3_functor(x), fy = d3_functor(y), d, i = -1, n = data.length;
        while (++i < n) {
          (points[i] = [
            +fx.call(this, d = data[i], i),
            +fy.call(this, d, i)
          ]).data = d;
        }
        return d3.geom.delaunay(points).map(function (triangle) {
          return triangle.map(function (point) {
            return point.data;
          });
        });
      };
      return voronoi;
    };
    var d3_geom_voronoiOpposite = {
        l: 'r',
        r: 'l'
      };
    function d3_geom_voronoiTessellate(points, callback) {
      var Sites = {
          list: points.map(function (v, i) {
            return {
              index: i,
              x: v[0],
              y: v[1]
            };
          }).sort(function (a, b) {
            return a.y < b.y ? -1 : a.y > b.y ? 1 : a.x < b.x ? -1 : a.x > b.x ? 1 : 0;
          }),
          bottomSite: null
        };
      var EdgeList = {
          list: [],
          leftEnd: null,
          rightEnd: null,
          init: function () {
            EdgeList.leftEnd = EdgeList.createHalfEdge(null, 'l');
            EdgeList.rightEnd = EdgeList.createHalfEdge(null, 'l');
            EdgeList.leftEnd.r = EdgeList.rightEnd;
            EdgeList.rightEnd.l = EdgeList.leftEnd;
            EdgeList.list.unshift(EdgeList.leftEnd, EdgeList.rightEnd);
          },
          createHalfEdge: function (edge, side) {
            return {
              edge: edge,
              side: side,
              vertex: null,
              l: null,
              r: null
            };
          },
          insert: function (lb, he) {
            he.l = lb;
            he.r = lb.r;
            lb.r.l = he;
            lb.r = he;
          },
          leftBound: function (p) {
            var he = EdgeList.leftEnd;
            do {
              he = he.r;
            } while (he != EdgeList.rightEnd && Geom.rightOf(he, p));
            he = he.l;
            return he;
          },
          del: function (he) {
            he.l.r = he.r;
            he.r.l = he.l;
            he.edge = null;
          },
          right: function (he) {
            return he.r;
          },
          left: function (he) {
            return he.l;
          },
          leftRegion: function (he) {
            return he.edge == null ? Sites.bottomSite : he.edge.region[he.side];
          },
          rightRegion: function (he) {
            return he.edge == null ? Sites.bottomSite : he.edge.region[d3_geom_voronoiOpposite[he.side]];
          }
        };
      var Geom = {
          bisect: function (s1, s2) {
            var newEdge = {
                region: {
                  l: s1,
                  r: s2
                },
                ep: {
                  l: null,
                  r: null
                }
              };
            var dx = s2.x - s1.x, dy = s2.y - s1.y, adx = dx > 0 ? dx : -dx, ady = dy > 0 ? dy : -dy;
            newEdge.c = s1.x * dx + s1.y * dy + (dx * dx + dy * dy) * 0.5;
            if (adx > ady) {
              newEdge.a = 1;
              newEdge.b = dy / dx;
              newEdge.c /= dx;
            } else {
              newEdge.b = 1;
              newEdge.a = dx / dy;
              newEdge.c /= dy;
            }
            return newEdge;
          },
          intersect: function (el1, el2) {
            var e1 = el1.edge, e2 = el2.edge;
            if (!e1 || !e2 || e1.region.r == e2.region.r) {
              return null;
            }
            var d = e1.a * e2.b - e1.b * e2.a;
            if (Math.abs(d) < 1e-10) {
              return null;
            }
            var xint = (e1.c * e2.b - e2.c * e1.b) / d, yint = (e2.c * e1.a - e1.c * e2.a) / d, e1r = e1.region.r, e2r = e2.region.r, el, e;
            if (e1r.y < e2r.y || e1r.y == e2r.y && e1r.x < e2r.x) {
              el = el1;
              e = e1;
            } else {
              el = el2;
              e = e2;
            }
            var rightOfSite = xint >= e.region.r.x;
            if (rightOfSite && el.side === 'l' || !rightOfSite && el.side === 'r') {
              return null;
            }
            return {
              x: xint,
              y: yint
            };
          },
          rightOf: function (he, p) {
            var e = he.edge, topsite = e.region.r, rightOfSite = p.x > topsite.x;
            if (rightOfSite && he.side === 'l') {
              return 1;
            }
            if (!rightOfSite && he.side === 'r') {
              return 0;
            }
            if (e.a === 1) {
              var dyp = p.y - topsite.y, dxp = p.x - topsite.x, fast = 0, above = 0;
              if (!rightOfSite && e.b < 0 || rightOfSite && e.b >= 0) {
                above = fast = dyp >= e.b * dxp;
              } else {
                above = p.x + p.y * e.b > e.c;
                if (e.b < 0) {
                  above = !above;
                }
                if (!above) {
                  fast = 1;
                }
              }
              if (!fast) {
                var dxs = topsite.x - e.region.l.x;
                above = e.b * (dxp * dxp - dyp * dyp) < dxs * dyp * (1 + 2 * dxp / dxs + e.b * e.b);
                if (e.b < 0) {
                  above = !above;
                }
              }
            } else {
              var yl = e.c - e.a * p.x, t1 = p.y - yl, t2 = p.x - topsite.x, t3 = yl - topsite.y;
              above = t1 * t1 > t2 * t2 + t3 * t3;
            }
            return he.side === 'l' ? above : !above;
          },
          endPoint: function (edge, side, site) {
            edge.ep[side] = site;
            if (!edge.ep[d3_geom_voronoiOpposite[side]])
              return;
            callback(edge);
          },
          distance: function (s, t) {
            var dx = s.x - t.x, dy = s.y - t.y;
            return Math.sqrt(dx * dx + dy * dy);
          }
        };
      var EventQueue = {
          list: [],
          insert: function (he, site, offset) {
            he.vertex = site;
            he.ystar = site.y + offset;
            for (var i = 0, list = EventQueue.list, l = list.length; i < l; i++) {
              var next = list[i];
              if (he.ystar > next.ystar || he.ystar == next.ystar && site.x > next.vertex.x) {
                continue;
              } else {
                break;
              }
            }
            list.splice(i, 0, he);
          },
          del: function (he) {
            for (var i = 0, ls = EventQueue.list, l = ls.length; i < l && ls[i] != he; ++i) {
            }
            ls.splice(i, 1);
          },
          empty: function () {
            return EventQueue.list.length === 0;
          },
          nextEvent: function (he) {
            for (var i = 0, ls = EventQueue.list, l = ls.length; i < l; ++i) {
              if (ls[i] == he)
                return ls[i + 1];
            }
            return null;
          },
          min: function () {
            var elem = EventQueue.list[0];
            return {
              x: elem.vertex.x,
              y: elem.ystar
            };
          },
          extractMin: function () {
            return EventQueue.list.shift();
          }
        };
      EdgeList.init();
      Sites.bottomSite = Sites.list.shift();
      var newSite = Sites.list.shift(), newIntStar;
      var lbnd, rbnd, llbnd, rrbnd, bisector;
      var bot, top, temp, p, v;
      var e, pm;
      while (true) {
        if (!EventQueue.empty()) {
          newIntStar = EventQueue.min();
        }
        if (newSite && (EventQueue.empty() || newSite.y < newIntStar.y || newSite.y == newIntStar.y && newSite.x < newIntStar.x)) {
          lbnd = EdgeList.leftBound(newSite);
          rbnd = EdgeList.right(lbnd);
          bot = EdgeList.rightRegion(lbnd);
          e = Geom.bisect(bot, newSite);
          bisector = EdgeList.createHalfEdge(e, 'l');
          EdgeList.insert(lbnd, bisector);
          p = Geom.intersect(lbnd, bisector);
          if (p) {
            EventQueue.del(lbnd);
            EventQueue.insert(lbnd, p, Geom.distance(p, newSite));
          }
          lbnd = bisector;
          bisector = EdgeList.createHalfEdge(e, 'r');
          EdgeList.insert(lbnd, bisector);
          p = Geom.intersect(bisector, rbnd);
          if (p) {
            EventQueue.insert(bisector, p, Geom.distance(p, newSite));
          }
          newSite = Sites.list.shift();
        } else if (!EventQueue.empty()) {
          lbnd = EventQueue.extractMin();
          llbnd = EdgeList.left(lbnd);
          rbnd = EdgeList.right(lbnd);
          rrbnd = EdgeList.right(rbnd);
          bot = EdgeList.leftRegion(lbnd);
          top = EdgeList.rightRegion(rbnd);
          v = lbnd.vertex;
          Geom.endPoint(lbnd.edge, lbnd.side, v);
          Geom.endPoint(rbnd.edge, rbnd.side, v);
          EdgeList.del(lbnd);
          EventQueue.del(rbnd);
          EdgeList.del(rbnd);
          pm = 'l';
          if (bot.y > top.y) {
            temp = bot;
            bot = top;
            top = temp;
            pm = 'r';
          }
          e = Geom.bisect(bot, top);
          bisector = EdgeList.createHalfEdge(e, pm);
          EdgeList.insert(llbnd, bisector);
          Geom.endPoint(e, d3_geom_voronoiOpposite[pm], v);
          p = Geom.intersect(llbnd, bisector);
          if (p) {
            EventQueue.del(llbnd);
            EventQueue.insert(llbnd, p, Geom.distance(p, bot));
          }
          p = Geom.intersect(bisector, rrbnd);
          if (p) {
            EventQueue.insert(bisector, p, Geom.distance(p, bot));
          }
        } else {
          break;
        }
      }
      for (lbnd = EdgeList.right(EdgeList.leftEnd); lbnd != EdgeList.rightEnd; lbnd = EdgeList.right(lbnd)) {
        callback(lbnd.edge);
      }
    }
    d3.geom.quadtree = function (points, x1, y1, x2, y2) {
      var x = d3_svg_lineX, y = d3_svg_lineY, compat;
      if (compat = arguments.length) {
        x = d3_geom_quadtreeCompatX;
        y = d3_geom_quadtreeCompatY;
        if (compat === 3) {
          y2 = y1;
          x2 = x1;
          y1 = x1 = 0;
        }
        return quadtree(points);
      }
      function quadtree(data) {
        var d, fx = d3_functor(x), fy = d3_functor(y), xs, ys, i, n, x1_, y1_, x2_, y2_;
        if (x1 != null) {
          x1_ = x1, y1_ = y1, x2_ = x2, y2_ = y2;
        } else {
          x2_ = y2_ = -(x1_ = y1_ = Infinity);
          xs = [], ys = [];
          n = data.length;
          if (compat)
            for (i = 0; i < n; ++i) {
              d = data[i];
              if (d.x < x1_)
                x1_ = d.x;
              if (d.y < y1_)
                y1_ = d.y;
              if (d.x > x2_)
                x2_ = d.x;
              if (d.y > y2_)
                y2_ = d.y;
              xs.push(d.x);
              ys.push(d.y);
            }
          else
            for (i = 0; i < n; ++i) {
              var x_ = +fx(d = data[i], i), y_ = +fy(d, i);
              if (x_ < x1_)
                x1_ = x_;
              if (y_ < y1_)
                y1_ = y_;
              if (x_ > x2_)
                x2_ = x_;
              if (y_ > y2_)
                y2_ = y_;
              xs.push(x_);
              ys.push(y_);
            }
        }
        var dx = x2_ - x1_, dy = y2_ - y1_;
        if (dx > dy)
          y2_ = y1_ + dx;
        else
          x2_ = x1_ + dy;
        function insert(n, d, x, y, x1, y1, x2, y2) {
          if (isNaN(x) || isNaN(y))
            return;
          if (n.leaf) {
            var nx = n.x, ny = n.y;
            if (nx != null) {
              if (Math.abs(nx - x) + Math.abs(ny - y) < 0.01) {
                insertChild(n, d, x, y, x1, y1, x2, y2);
              } else {
                var nPoint = n.point;
                n.x = n.y = n.point = null;
                insertChild(n, nPoint, nx, ny, x1, y1, x2, y2);
                insertChild(n, d, x, y, x1, y1, x2, y2);
              }
            } else {
              n.x = x, n.y = y, n.point = d;
            }
          } else {
            insertChild(n, d, x, y, x1, y1, x2, y2);
          }
        }
        function insertChild(n, d, x, y, x1, y1, x2, y2) {
          var sx = (x1 + x2) * 0.5, sy = (y1 + y2) * 0.5, right = x >= sx, bottom = y >= sy, i = (bottom << 1) + right;
          n.leaf = false;
          n = n.nodes[i] || (n.nodes[i] = d3_geom_quadtreeNode());
          if (right)
            x1 = sx;
          else
            x2 = sx;
          if (bottom)
            y1 = sy;
          else
            y2 = sy;
          insert(n, d, x, y, x1, y1, x2, y2);
        }
        var root = d3_geom_quadtreeNode();
        root.add = function (d) {
          insert(root, d, +fx(d, ++i), +fy(d, i), x1_, y1_, x2_, y2_);
        };
        root.visit = function (f) {
          d3_geom_quadtreeVisit(f, root, x1_, y1_, x2_, y2_);
        };
        i = -1;
        if (x1 == null) {
          while (++i < n) {
            insert(root, data[i], xs[i], ys[i], x1_, y1_, x2_, y2_);
          }
          --i;
        } else
          data.forEach(root.add);
        xs = ys = data = d = null;
        return root;
      }
      quadtree.x = function (_) {
        return arguments.length ? (x = _, quadtree) : x;
      };
      quadtree.y = function (_) {
        return arguments.length ? (y = _, quadtree) : y;
      };
      quadtree.extent = function (_) {
        if (!arguments.length)
          return x1 == null ? null : [
            [
              x1,
              y1
            ],
            [
              x2,
              y2
            ]
          ];
        if (_ == null)
          x1 = y1 = x2 = y2 = null;
        else
          x1 = +_[0][0], y1 = +_[0][1], x2 = +_[1][0], y2 = +_[1][1];
        return quadtree;
      };
      quadtree.size = function (_) {
        if (!arguments.length)
          return x1 == null ? null : [
            x2 - x1,
            y2 - y1
          ];
        if (_ == null)
          x1 = y1 = x2 = y2 = null;
        else
          x1 = y1 = 0, x2 = +_[0], y2 = +_[1];
        return quadtree;
      };
      return quadtree;
    };
    function d3_geom_quadtreeCompatX(d) {
      return d.x;
    }
    function d3_geom_quadtreeCompatY(d) {
      return d.y;
    }
    function d3_geom_quadtreeNode() {
      return {
        leaf: true,
        nodes: [],
        point: null,
        x: null,
        y: null
      };
    }
    function d3_geom_quadtreeVisit(f, node, x1, y1, x2, y2) {
      if (!f(node, x1, y1, x2, y2)) {
        var sx = (x1 + x2) * 0.5, sy = (y1 + y2) * 0.5, children = node.nodes;
        if (children[0])
          d3_geom_quadtreeVisit(f, children[0], x1, y1, sx, sy);
        if (children[1])
          d3_geom_quadtreeVisit(f, children[1], sx, y1, x2, sy);
        if (children[2])
          d3_geom_quadtreeVisit(f, children[2], x1, sy, sx, y2);
        if (children[3])
          d3_geom_quadtreeVisit(f, children[3], sx, sy, x2, y2);
      }
    }
    d3.interpolateRgb = d3_interpolateRgb;
    function d3_interpolateRgb(a, b) {
      a = d3.rgb(a);
      b = d3.rgb(b);
      var ar = a.r, ag = a.g, ab = a.b, br = b.r - ar, bg = b.g - ag, bb = b.b - ab;
      return function (t) {
        return '#' + d3_rgb_hex(Math.round(ar + br * t)) + d3_rgb_hex(Math.round(ag + bg * t)) + d3_rgb_hex(Math.round(ab + bb * t));
      };
    }
    d3.interpolateObject = d3_interpolateObject;
    function d3_interpolateObject(a, b) {
      var i = {}, c = {}, k;
      for (k in a) {
        if (k in b) {
          i[k] = d3_interpolate(a[k], b[k]);
        } else {
          c[k] = a[k];
        }
      }
      for (k in b) {
        if (!(k in a)) {
          c[k] = b[k];
        }
      }
      return function (t) {
        for (k in i)
          c[k] = i[k](t);
        return c;
      };
    }
    d3.interpolateNumber = d3_interpolateNumber;
    function d3_interpolateNumber(a, b) {
      b -= a = +a;
      return function (t) {
        return a + b * t;
      };
    }
    d3.interpolateString = d3_interpolateString;
    function d3_interpolateString(a, b) {
      var m, i, j, s0 = 0, s1 = 0, s = [], q = [], n, o;
      a = a + '', b = b + '';
      d3_interpolate_number.lastIndex = 0;
      for (i = 0; m = d3_interpolate_number.exec(b); ++i) {
        if (m.index)
          s.push(b.substring(s0, s1 = m.index));
        q.push({
          i: s.length,
          x: m[0]
        });
        s.push(null);
        s0 = d3_interpolate_number.lastIndex;
      }
      if (s0 < b.length)
        s.push(b.substring(s0));
      for (i = 0, n = q.length; (m = d3_interpolate_number.exec(a)) && i < n; ++i) {
        o = q[i];
        if (o.x == m[0]) {
          if (o.i) {
            if (s[o.i + 1] == null) {
              s[o.i - 1] += o.x;
              s.splice(o.i, 1);
              for (j = i + 1; j < n; ++j)
                q[j].i--;
            } else {
              s[o.i - 1] += o.x + s[o.i + 1];
              s.splice(o.i, 2);
              for (j = i + 1; j < n; ++j)
                q[j].i -= 2;
            }
          } else {
            if (s[o.i + 1] == null) {
              s[o.i] = o.x;
            } else {
              s[o.i] = o.x + s[o.i + 1];
              s.splice(o.i + 1, 1);
              for (j = i + 1; j < n; ++j)
                q[j].i--;
            }
          }
          q.splice(i, 1);
          n--;
          i--;
        } else {
          o.x = d3_interpolateNumber(parseFloat(m[0]), parseFloat(o.x));
        }
      }
      while (i < n) {
        o = q.pop();
        if (s[o.i + 1] == null) {
          s[o.i] = o.x;
        } else {
          s[o.i] = o.x + s[o.i + 1];
          s.splice(o.i + 1, 1);
        }
        n--;
      }
      if (s.length === 1) {
        return s[0] == null ? (o = q[0].x, function (t) {
          return o(t) + '';
        }) : function () {
          return b;
        };
      }
      return function (t) {
        for (i = 0; i < n; ++i)
          s[(o = q[i]).i] = o.x(t);
        return s.join('');
      };
    }
    var d3_interpolate_number = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
    d3.interpolate = d3_interpolate;
    function d3_interpolate(a, b) {
      var i = d3.interpolators.length, f;
      while (--i >= 0 && !(f = d3.interpolators[i](a, b)));
      return f;
    }
    d3.interpolators = [function (a, b) {
        var t = typeof b;
        return (t === 'string' ? d3_rgb_names.has(b) || /^(#|rgb\(|hsl\()/.test(b) ? d3_interpolateRgb : d3_interpolateString : b instanceof d3_Color ? d3_interpolateRgb : t === 'object' ? Array.isArray(b) ? d3_interpolateArray : d3_interpolateObject : d3_interpolateNumber)(a, b);
      }];
    d3.interpolateArray = d3_interpolateArray;
    function d3_interpolateArray(a, b) {
      var x = [], c = [], na = a.length, nb = b.length, n0 = Math.min(a.length, b.length), i;
      for (i = 0; i < n0; ++i)
        x.push(d3_interpolate(a[i], b[i]));
      for (; i < na; ++i)
        c[i] = a[i];
      for (; i < nb; ++i)
        c[i] = b[i];
      return function (t) {
        for (i = 0; i < n0; ++i)
          c[i] = x[i](t);
        return c;
      };
    }
    var d3_ease_default = function () {
      return d3_identity;
    };
    var d3_ease = d3.map({
        linear: d3_ease_default,
        poly: d3_ease_poly,
        quad: function () {
          return d3_ease_quad;
        },
        cubic: function () {
          return d3_ease_cubic;
        },
        sin: function () {
          return d3_ease_sin;
        },
        exp: function () {
          return d3_ease_exp;
        },
        circle: function () {
          return d3_ease_circle;
        },
        elastic: d3_ease_elastic,
        back: d3_ease_back,
        bounce: function () {
          return d3_ease_bounce;
        }
      });
    var d3_ease_mode = d3.map({
        'in': d3_identity,
        out: d3_ease_reverse,
        'in-out': d3_ease_reflect,
        'out-in': function (f) {
          return d3_ease_reflect(d3_ease_reverse(f));
        }
      });
    d3.ease = function (name) {
      var i = name.indexOf('-'), t = i >= 0 ? name.substring(0, i) : name, m = i >= 0 ? name.substring(i + 1) : 'in';
      t = d3_ease.get(t) || d3_ease_default;
      m = d3_ease_mode.get(m) || d3_identity;
      return d3_ease_clamp(m(t.apply(null, Array.prototype.slice.call(arguments, 1))));
    };
    function d3_ease_clamp(f) {
      return function (t) {
        return t <= 0 ? 0 : t >= 1 ? 1 : f(t);
      };
    }
    function d3_ease_reverse(f) {
      return function (t) {
        return 1 - f(1 - t);
      };
    }
    function d3_ease_reflect(f) {
      return function (t) {
        return 0.5 * (t < 0.5 ? f(2 * t) : 2 - f(2 - 2 * t));
      };
    }
    function d3_ease_quad(t) {
      return t * t;
    }
    function d3_ease_cubic(t) {
      return t * t * t;
    }
    function d3_ease_cubicInOut(t) {
      if (t <= 0)
        return 0;
      if (t >= 1)
        return 1;
      var t2 = t * t, t3 = t2 * t;
      return 4 * (t < 0.5 ? t3 : 3 * (t - t2) + t3 - 0.75);
    }
    function d3_ease_poly(e) {
      return function (t) {
        return Math.pow(t, e);
      };
    }
    function d3_ease_sin(t) {
      return 1 - Math.cos(t * halfπ);
    }
    function d3_ease_exp(t) {
      return Math.pow(2, 10 * (t - 1));
    }
    function d3_ease_circle(t) {
      return 1 - Math.sqrt(1 - t * t);
    }
    function d3_ease_elastic(a, p) {
      var s;
      if (arguments.length < 2)
        p = 0.45;
      if (arguments.length)
        s = p / τ * Math.asin(1 / a);
      else
        a = 1, s = p / 4;
      return function (t) {
        return 1 + a * Math.pow(2, -10 * t) * Math.sin((t - s) * τ / p);
      };
    }
    function d3_ease_back(s) {
      if (!s)
        s = 1.70158;
      return function (t) {
        return t * t * ((s + 1) * t - s);
      };
    }
    function d3_ease_bounce(t) {
      return t < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + 0.75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375 : 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
    d3.interpolateHcl = d3_interpolateHcl;
    function d3_interpolateHcl(a, b) {
      a = d3.hcl(a);
      b = d3.hcl(b);
      var ah = a.h, ac = a.c, al = a.l, bh = b.h - ah, bc = b.c - ac, bl = b.l - al;
      if (isNaN(bc))
        bc = 0, ac = isNaN(ac) ? b.c : ac;
      if (isNaN(bh))
        bh = 0, ah = isNaN(ah) ? b.h : ah;
      else if (bh > 180)
        bh -= 360;
      else if (bh < -180)
        bh += 360;
      return function (t) {
        return d3_hcl_lab(ah + bh * t, ac + bc * t, al + bl * t) + '';
      };
    }
    d3.interpolateHsl = d3_interpolateHsl;
    function d3_interpolateHsl(a, b) {
      a = d3.hsl(a);
      b = d3.hsl(b);
      var ah = a.h, as = a.s, al = a.l, bh = b.h - ah, bs = b.s - as, bl = b.l - al;
      if (isNaN(bs))
        bs = 0, as = isNaN(as) ? b.s : as;
      if (isNaN(bh))
        bh = 0, ah = isNaN(ah) ? b.h : ah;
      else if (bh > 180)
        bh -= 360;
      else if (bh < -180)
        bh += 360;
      return function (t) {
        return d3_hsl_rgb(ah + bh * t, as + bs * t, al + bl * t) + '';
      };
    }
    d3.interpolateLab = d3_interpolateLab;
    function d3_interpolateLab(a, b) {
      a = d3.lab(a);
      b = d3.lab(b);
      var al = a.l, aa = a.a, ab = a.b, bl = b.l - al, ba = b.a - aa, bb = b.b - ab;
      return function (t) {
        return d3_lab_rgb(al + bl * t, aa + ba * t, ab + bb * t) + '';
      };
    }
    d3.interpolateRound = d3_interpolateRound;
    function d3_interpolateRound(a, b) {
      b -= a;
      return function (t) {
        return Math.round(a + b * t);
      };
    }
    d3.transform = function (string) {
      var g = d3_document.createElementNS(d3.ns.prefix.svg, 'g');
      return (d3.transform = function (string) {
        if (string != null) {
          g.setAttribute('transform', string);
          var t = g.transform.baseVal.consolidate();
        }
        return new d3_transform(t ? t.matrix : d3_transformIdentity);
      })(string);
    };
    function d3_transform(m) {
      var r0 = [
          m.a,
          m.b
        ], r1 = [
          m.c,
          m.d
        ], kx = d3_transformNormalize(r0), kz = d3_transformDot(r0, r1), ky = d3_transformNormalize(d3_transformCombine(r1, r0, -kz)) || 0;
      if (r0[0] * r1[1] < r1[0] * r0[1]) {
        r0[0] *= -1;
        r0[1] *= -1;
        kx *= -1;
        kz *= -1;
      }
      this.rotate = (kx ? Math.atan2(r0[1], r0[0]) : Math.atan2(-r1[0], r1[1])) * d3_degrees;
      this.translate = [
        m.e,
        m.f
      ];
      this.scale = [
        kx,
        ky
      ];
      this.skew = ky ? Math.atan2(kz, ky) * d3_degrees : 0;
    }
    d3_transform.prototype.toString = function () {
      return 'translate(' + this.translate + ')rotate(' + this.rotate + ')skewX(' + this.skew + ')scale(' + this.scale + ')';
    };
    function d3_transformDot(a, b) {
      return a[0] * b[0] + a[1] * b[1];
    }
    function d3_transformNormalize(a) {
      var k = Math.sqrt(d3_transformDot(a, a));
      if (k) {
        a[0] /= k;
        a[1] /= k;
      }
      return k;
    }
    function d3_transformCombine(a, b, k) {
      a[0] += k * b[0];
      a[1] += k * b[1];
      return a;
    }
    var d3_transformIdentity = {
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: 0,
        f: 0
      };
    d3.interpolateTransform = d3_interpolateTransform;
    function d3_interpolateTransform(a, b) {
      var s = [], q = [], n, A = d3.transform(a), B = d3.transform(b), ta = A.translate, tb = B.translate, ra = A.rotate, rb = B.rotate, wa = A.skew, wb = B.skew, ka = A.scale, kb = B.scale;
      if (ta[0] != tb[0] || ta[1] != tb[1]) {
        s.push('translate(', null, ',', null, ')');
        q.push({
          i: 1,
          x: d3_interpolateNumber(ta[0], tb[0])
        }, {
          i: 3,
          x: d3_interpolateNumber(ta[1], tb[1])
        });
      } else if (tb[0] || tb[1]) {
        s.push('translate(' + tb + ')');
      } else {
        s.push('');
      }
      if (ra != rb) {
        if (ra - rb > 180)
          rb += 360;
        else if (rb - ra > 180)
          ra += 360;
        q.push({
          i: s.push(s.pop() + 'rotate(', null, ')') - 2,
          x: d3_interpolateNumber(ra, rb)
        });
      } else if (rb) {
        s.push(s.pop() + 'rotate(' + rb + ')');
      }
      if (wa != wb) {
        q.push({
          i: s.push(s.pop() + 'skewX(', null, ')') - 2,
          x: d3_interpolateNumber(wa, wb)
        });
      } else if (wb) {
        s.push(s.pop() + 'skewX(' + wb + ')');
      }
      if (ka[0] != kb[0] || ka[1] != kb[1]) {
        n = s.push(s.pop() + 'scale(', null, ',', null, ')');
        q.push({
          i: n - 4,
          x: d3_interpolateNumber(ka[0], kb[0])
        }, {
          i: n - 2,
          x: d3_interpolateNumber(ka[1], kb[1])
        });
      } else if (kb[0] != 1 || kb[1] != 1) {
        s.push(s.pop() + 'scale(' + kb + ')');
      }
      n = q.length;
      return function (t) {
        var i = -1, o;
        while (++i < n)
          s[(o = q[i]).i] = o.x(t);
        return s.join('');
      };
    }
    function d3_uninterpolateNumber(a, b) {
      b = b - (a = +a) ? 1 / (b - a) : 0;
      return function (x) {
        return (x - a) * b;
      };
    }
    function d3_uninterpolateClamp(a, b) {
      b = b - (a = +a) ? 1 / (b - a) : 0;
      return function (x) {
        return Math.max(0, Math.min(1, (x - a) * b));
      };
    }
    d3.layout = {};
    d3.layout.bundle = function () {
      return function (links) {
        var paths = [], i = -1, n = links.length;
        while (++i < n)
          paths.push(d3_layout_bundlePath(links[i]));
        return paths;
      };
    };
    function d3_layout_bundlePath(link) {
      var start = link.source, end = link.target, lca = d3_layout_bundleLeastCommonAncestor(start, end), points = [start];
      while (start !== lca) {
        start = start.parent;
        points.push(start);
      }
      var k = points.length;
      while (end !== lca) {
        points.splice(k, 0, end);
        end = end.parent;
      }
      return points;
    }
    function d3_layout_bundleAncestors(node) {
      var ancestors = [], parent = node.parent;
      while (parent != null) {
        ancestors.push(node);
        node = parent;
        parent = parent.parent;
      }
      ancestors.push(node);
      return ancestors;
    }
    function d3_layout_bundleLeastCommonAncestor(a, b) {
      if (a === b)
        return a;
      var aNodes = d3_layout_bundleAncestors(a), bNodes = d3_layout_bundleAncestors(b), aNode = aNodes.pop(), bNode = bNodes.pop(), sharedNode = null;
      while (aNode === bNode) {
        sharedNode = aNode;
        aNode = aNodes.pop();
        bNode = bNodes.pop();
      }
      return sharedNode;
    }
    d3.layout.chord = function () {
      var chord = {}, chords, groups, matrix, n, padding = 0, sortGroups, sortSubgroups, sortChords;
      function relayout() {
        var subgroups = {}, groupSums = [], groupIndex = d3.range(n), subgroupIndex = [], k, x, x0, i, j;
        chords = [];
        groups = [];
        k = 0, i = -1;
        while (++i < n) {
          x = 0, j = -1;
          while (++j < n) {
            x += matrix[i][j];
          }
          groupSums.push(x);
          subgroupIndex.push(d3.range(n));
          k += x;
        }
        if (sortGroups) {
          groupIndex.sort(function (a, b) {
            return sortGroups(groupSums[a], groupSums[b]);
          });
        }
        if (sortSubgroups) {
          subgroupIndex.forEach(function (d, i) {
            d.sort(function (a, b) {
              return sortSubgroups(matrix[i][a], matrix[i][b]);
            });
          });
        }
        k = (τ - padding * n) / k;
        x = 0, i = -1;
        while (++i < n) {
          x0 = x, j = -1;
          while (++j < n) {
            var di = groupIndex[i], dj = subgroupIndex[di][j], v = matrix[di][dj], a0 = x, a1 = x += v * k;
            subgroups[di + '-' + dj] = {
              index: di,
              subindex: dj,
              startAngle: a0,
              endAngle: a1,
              value: v
            };
          }
          groups[di] = {
            index: di,
            startAngle: x0,
            endAngle: x,
            value: (x - x0) / k
          };
          x += padding;
        }
        i = -1;
        while (++i < n) {
          j = i - 1;
          while (++j < n) {
            var source = subgroups[i + '-' + j], target = subgroups[j + '-' + i];
            if (source.value || target.value) {
              chords.push(source.value < target.value ? {
                source: target,
                target: source
              } : {
                source: source,
                target: target
              });
            }
          }
        }
        if (sortChords)
          resort();
      }
      function resort() {
        chords.sort(function (a, b) {
          return sortChords((a.source.value + a.target.value) / 2, (b.source.value + b.target.value) / 2);
        });
      }
      chord.matrix = function (x) {
        if (!arguments.length)
          return matrix;
        n = (matrix = x) && matrix.length;
        chords = groups = null;
        return chord;
      };
      chord.padding = function (x) {
        if (!arguments.length)
          return padding;
        padding = x;
        chords = groups = null;
        return chord;
      };
      chord.sortGroups = function (x) {
        if (!arguments.length)
          return sortGroups;
        sortGroups = x;
        chords = groups = null;
        return chord;
      };
      chord.sortSubgroups = function (x) {
        if (!arguments.length)
          return sortSubgroups;
        sortSubgroups = x;
        chords = null;
        return chord;
      };
      chord.sortChords = function (x) {
        if (!arguments.length)
          return sortChords;
        sortChords = x;
        if (chords)
          resort();
        return chord;
      };
      chord.chords = function () {
        if (!chords)
          relayout();
        return chords;
      };
      chord.groups = function () {
        if (!groups)
          relayout();
        return groups;
      };
      return chord;
    };
    d3.layout.force = function () {
      var force = {}, event = d3.dispatch('start', 'tick', 'end'), size = [
          1,
          1
        ], drag, alpha, friction = 0.9, linkDistance = d3_layout_forceLinkDistance, linkStrength = d3_layout_forceLinkStrength, charge = -30, gravity = 0.1, theta = 0.8, nodes = [], links = [], distances, strengths, charges;
      function repulse(node) {
        return function (quad, x1, _, x2) {
          if (quad.point !== node) {
            var dx = quad.cx - node.x, dy = quad.cy - node.y, dn = 1 / Math.sqrt(dx * dx + dy * dy);
            if ((x2 - x1) * dn < theta) {
              var k = quad.charge * dn * dn;
              node.px -= dx * k;
              node.py -= dy * k;
              return true;
            }
            if (quad.point && isFinite(dn)) {
              var k = quad.pointCharge * dn * dn;
              node.px -= dx * k;
              node.py -= dy * k;
            }
          }
          return !quad.charge;
        };
      }
      force.tick = function () {
        if ((alpha *= 0.99) < 0.005) {
          event.end({
            type: 'end',
            alpha: alpha = 0
          });
          return true;
        }
        var n = nodes.length, m = links.length, q, i, o, s, t, l, k, x, y;
        for (i = 0; i < m; ++i) {
          o = links[i];
          s = o.source;
          t = o.target;
          x = t.x - s.x;
          y = t.y - s.y;
          if (l = x * x + y * y) {
            l = alpha * strengths[i] * ((l = Math.sqrt(l)) - distances[i]) / l;
            x *= l;
            y *= l;
            t.x -= x * (k = s.weight / (t.weight + s.weight));
            t.y -= y * k;
            s.x += x * (k = 1 - k);
            s.y += y * k;
          }
        }
        if (k = alpha * gravity) {
          x = size[0] / 2;
          y = size[1] / 2;
          i = -1;
          if (k)
            while (++i < n) {
              o = nodes[i];
              o.x += (x - o.x) * k;
              o.y += (y - o.y) * k;
            }
        }
        if (charge) {
          d3_layout_forceAccumulate(q = d3.geom.quadtree(nodes), alpha, charges);
          i = -1;
          while (++i < n) {
            if (!(o = nodes[i]).fixed) {
              q.visit(repulse(o));
            }
          }
        }
        i = -1;
        while (++i < n) {
          o = nodes[i];
          if (o.fixed) {
            o.x = o.px;
            o.y = o.py;
          } else {
            o.x -= (o.px - (o.px = o.x)) * friction;
            o.y -= (o.py - (o.py = o.y)) * friction;
          }
        }
        event.tick({
          type: 'tick',
          alpha: alpha
        });
      };
      force.nodes = function (x) {
        if (!arguments.length)
          return nodes;
        nodes = x;
        return force;
      };
      force.links = function (x) {
        if (!arguments.length)
          return links;
        links = x;
        return force;
      };
      force.size = function (x) {
        if (!arguments.length)
          return size;
        size = x;
        return force;
      };
      force.linkDistance = function (x) {
        if (!arguments.length)
          return linkDistance;
        linkDistance = typeof x === 'function' ? x : +x;
        return force;
      };
      force.distance = force.linkDistance;
      force.linkStrength = function (x) {
        if (!arguments.length)
          return linkStrength;
        linkStrength = typeof x === 'function' ? x : +x;
        return force;
      };
      force.friction = function (x) {
        if (!arguments.length)
          return friction;
        friction = +x;
        return force;
      };
      force.charge = function (x) {
        if (!arguments.length)
          return charge;
        charge = typeof x === 'function' ? x : +x;
        return force;
      };
      force.gravity = function (x) {
        if (!arguments.length)
          return gravity;
        gravity = +x;
        return force;
      };
      force.theta = function (x) {
        if (!arguments.length)
          return theta;
        theta = +x;
        return force;
      };
      force.alpha = function (x) {
        if (!arguments.length)
          return alpha;
        x = +x;
        if (alpha) {
          if (x > 0)
            alpha = x;
          else
            alpha = 0;
        } else if (x > 0) {
          event.start({
            type: 'start',
            alpha: alpha = x
          });
          d3.timer(force.tick);
        }
        return force;
      };
      force.start = function () {
        var i, j, n = nodes.length, m = links.length, w = size[0], h = size[1], neighbors, o;
        for (i = 0; i < n; ++i) {
          (o = nodes[i]).index = i;
          o.weight = 0;
        }
        for (i = 0; i < m; ++i) {
          o = links[i];
          if (typeof o.source == 'number')
            o.source = nodes[o.source];
          if (typeof o.target == 'number')
            o.target = nodes[o.target];
          ++o.source.weight;
          ++o.target.weight;
        }
        for (i = 0; i < n; ++i) {
          o = nodes[i];
          if (isNaN(o.x))
            o.x = position('x', w);
          if (isNaN(o.y))
            o.y = position('y', h);
          if (isNaN(o.px))
            o.px = o.x;
          if (isNaN(o.py))
            o.py = o.y;
        }
        distances = [];
        if (typeof linkDistance === 'function')
          for (i = 0; i < m; ++i)
            distances[i] = +linkDistance.call(this, links[i], i);
        else
          for (i = 0; i < m; ++i)
            distances[i] = linkDistance;
        strengths = [];
        if (typeof linkStrength === 'function')
          for (i = 0; i < m; ++i)
            strengths[i] = +linkStrength.call(this, links[i], i);
        else
          for (i = 0; i < m; ++i)
            strengths[i] = linkStrength;
        charges = [];
        if (typeof charge === 'function')
          for (i = 0; i < n; ++i)
            charges[i] = +charge.call(this, nodes[i], i);
        else
          for (i = 0; i < n; ++i)
            charges[i] = charge;
        function position(dimension, size) {
          var neighbors = neighbor(i), j = -1, m = neighbors.length, x;
          while (++j < m)
            if (!isNaN(x = neighbors[j][dimension]))
              return x;
          return Math.random() * size;
        }
        function neighbor() {
          if (!neighbors) {
            neighbors = [];
            for (j = 0; j < n; ++j) {
              neighbors[j] = [];
            }
            for (j = 0; j < m; ++j) {
              var o = links[j];
              neighbors[o.source.index].push(o.target);
              neighbors[o.target.index].push(o.source);
            }
          }
          return neighbors[i];
        }
        return force.resume();
      };
      force.resume = function () {
        return force.alpha(0.1);
      };
      force.stop = function () {
        return force.alpha(0);
      };
      force.drag = function () {
        if (!drag)
          drag = d3.behavior.drag().origin(d3_identity).on('dragstart.force', d3_layout_forceDragstart).on('drag.force', dragmove).on('dragend.force', d3_layout_forceDragend);
        if (!arguments.length)
          return drag;
        this.on('mouseover.force', d3_layout_forceMouseover).on('mouseout.force', d3_layout_forceMouseout).call(drag);
      };
      function dragmove(d) {
        d.px = d3.event.x, d.py = d3.event.y;
        force.resume();
      }
      return d3.rebind(force, event, 'on');
    };
    function d3_layout_forceDragstart(d) {
      d.fixed |= 2;
    }
    function d3_layout_forceDragend(d) {
      d.fixed &= ~6;
    }
    function d3_layout_forceMouseover(d) {
      d.fixed |= 4;
      d.px = d.x, d.py = d.y;
    }
    function d3_layout_forceMouseout(d) {
      d.fixed &= ~4;
    }
    function d3_layout_forceAccumulate(quad, alpha, charges) {
      var cx = 0, cy = 0;
      quad.charge = 0;
      if (!quad.leaf) {
        var nodes = quad.nodes, n = nodes.length, i = -1, c;
        while (++i < n) {
          c = nodes[i];
          if (c == null)
            continue;
          d3_layout_forceAccumulate(c, alpha, charges);
          quad.charge += c.charge;
          cx += c.charge * c.cx;
          cy += c.charge * c.cy;
        }
      }
      if (quad.point) {
        if (!quad.leaf) {
          quad.point.x += Math.random() - 0.5;
          quad.point.y += Math.random() - 0.5;
        }
        var k = alpha * charges[quad.point.index];
        quad.charge += quad.pointCharge = k;
        cx += k * quad.point.x;
        cy += k * quad.point.y;
      }
      quad.cx = cx / quad.charge;
      quad.cy = cy / quad.charge;
    }
    var d3_layout_forceLinkDistance = 20, d3_layout_forceLinkStrength = 1;
    d3.layout.hierarchy = function () {
      var sort = d3_layout_hierarchySort, children = d3_layout_hierarchyChildren, value = d3_layout_hierarchyValue;
      function recurse(node, depth, nodes) {
        var childs = children.call(hierarchy, node, depth);
        node.depth = depth;
        nodes.push(node);
        if (childs && (n = childs.length)) {
          var i = -1, n, c = node.children = [], v = 0, j = depth + 1, d;
          while (++i < n) {
            d = recurse(childs[i], j, nodes);
            d.parent = node;
            c.push(d);
            v += d.value;
          }
          if (sort)
            c.sort(sort);
          if (value)
            node.value = v;
        } else if (value) {
          node.value = +value.call(hierarchy, node, depth) || 0;
        }
        return node;
      }
      function revalue(node, depth) {
        var children = node.children, v = 0;
        if (children && (n = children.length)) {
          var i = -1, n, j = depth + 1;
          while (++i < n)
            v += revalue(children[i], j);
        } else if (value) {
          v = +value.call(hierarchy, node, depth) || 0;
        }
        if (value)
          node.value = v;
        return v;
      }
      function hierarchy(d) {
        var nodes = [];
        recurse(d, 0, nodes);
        return nodes;
      }
      hierarchy.sort = function (x) {
        if (!arguments.length)
          return sort;
        sort = x;
        return hierarchy;
      };
      hierarchy.children = function (x) {
        if (!arguments.length)
          return children;
        children = x;
        return hierarchy;
      };
      hierarchy.value = function (x) {
        if (!arguments.length)
          return value;
        value = x;
        return hierarchy;
      };
      hierarchy.revalue = function (root) {
        revalue(root, 0);
        return root;
      };
      return hierarchy;
    };
    function d3_layout_hierarchyRebind(object, hierarchy) {
      d3.rebind(object, hierarchy, 'sort', 'children', 'value');
      object.nodes = object;
      object.links = d3_layout_hierarchyLinks;
      return object;
    }
    function d3_layout_hierarchyChildren(d) {
      return d.children;
    }
    function d3_layout_hierarchyValue(d) {
      return d.value;
    }
    function d3_layout_hierarchySort(a, b) {
      return b.value - a.value;
    }
    function d3_layout_hierarchyLinks(nodes) {
      return d3.merge(nodes.map(function (parent) {
        return (parent.children || []).map(function (child) {
          return {
            source: parent,
            target: child
          };
        });
      }));
    }
    d3.layout.partition = function () {
      var hierarchy = d3.layout.hierarchy(), size = [
          1,
          1
        ];
      function position(node, x, dx, dy) {
        var children = node.children;
        node.x = x;
        node.y = node.depth * dy;
        node.dx = dx;
        node.dy = dy;
        if (children && (n = children.length)) {
          var i = -1, n, c, d;
          dx = node.value ? dx / node.value : 0;
          while (++i < n) {
            position(c = children[i], x, d = c.value * dx, dy);
            x += d;
          }
        }
      }
      function depth(node) {
        var children = node.children, d = 0;
        if (children && (n = children.length)) {
          var i = -1, n;
          while (++i < n)
            d = Math.max(d, depth(children[i]));
        }
        return 1 + d;
      }
      function partition(d, i) {
        var nodes = hierarchy.call(this, d, i);
        position(nodes[0], 0, size[0], size[1] / depth(nodes[0]));
        return nodes;
      }
      partition.size = function (x) {
        if (!arguments.length)
          return size;
        size = x;
        return partition;
      };
      return d3_layout_hierarchyRebind(partition, hierarchy);
    };
    d3.layout.pie = function () {
      var value = Number, sort = d3_layout_pieSortByValue, startAngle = 0, endAngle = τ;
      function pie(data) {
        var values = data.map(function (d, i) {
            return +value.call(pie, d, i);
          });
        var a = +(typeof startAngle === 'function' ? startAngle.apply(this, arguments) : startAngle);
        var k = ((typeof endAngle === 'function' ? endAngle.apply(this, arguments) : endAngle) - a) / d3.sum(values);
        var index = d3.range(data.length);
        if (sort != null)
          index.sort(sort === d3_layout_pieSortByValue ? function (i, j) {
            return values[j] - values[i];
          } : function (i, j) {
            return sort(data[i], data[j]);
          });
        var arcs = [];
        index.forEach(function (i) {
          var d;
          arcs[i] = {
            data: data[i],
            value: d = values[i],
            startAngle: a,
            endAngle: a += d * k
          };
        });
        return arcs;
      }
      pie.value = function (x) {
        if (!arguments.length)
          return value;
        value = x;
        return pie;
      };
      pie.sort = function (x) {
        if (!arguments.length)
          return sort;
        sort = x;
        return pie;
      };
      pie.startAngle = function (x) {
        if (!arguments.length)
          return startAngle;
        startAngle = x;
        return pie;
      };
      pie.endAngle = function (x) {
        if (!arguments.length)
          return endAngle;
        endAngle = x;
        return pie;
      };
      return pie;
    };
    var d3_layout_pieSortByValue = {};
    d3.layout.stack = function () {
      var values = d3_identity, order = d3_layout_stackOrderDefault, offset = d3_layout_stackOffsetZero, out = d3_layout_stackOut, x = d3_layout_stackX, y = d3_layout_stackY;
      function stack(data, index) {
        var series = data.map(function (d, i) {
            return values.call(stack, d, i);
          });
        var points = series.map(function (d) {
            return d.map(function (v, i) {
              return [
                x.call(stack, v, i),
                y.call(stack, v, i)
              ];
            });
          });
        var orders = order.call(stack, points, index);
        series = d3.permute(series, orders);
        points = d3.permute(points, orders);
        var offsets = offset.call(stack, points, index);
        var n = series.length, m = series[0].length, i, j, o;
        for (j = 0; j < m; ++j) {
          out.call(stack, series[0][j], o = offsets[j], points[0][j][1]);
          for (i = 1; i < n; ++i) {
            out.call(stack, series[i][j], o += points[i - 1][j][1], points[i][j][1]);
          }
        }
        return data;
      }
      stack.values = function (x) {
        if (!arguments.length)
          return values;
        values = x;
        return stack;
      };
      stack.order = function (x) {
        if (!arguments.length)
          return order;
        order = typeof x === 'function' ? x : d3_layout_stackOrders.get(x) || d3_layout_stackOrderDefault;
        return stack;
      };
      stack.offset = function (x) {
        if (!arguments.length)
          return offset;
        offset = typeof x === 'function' ? x : d3_layout_stackOffsets.get(x) || d3_layout_stackOffsetZero;
        return stack;
      };
      stack.x = function (z) {
        if (!arguments.length)
          return x;
        x = z;
        return stack;
      };
      stack.y = function (z) {
        if (!arguments.length)
          return y;
        y = z;
        return stack;
      };
      stack.out = function (z) {
        if (!arguments.length)
          return out;
        out = z;
        return stack;
      };
      return stack;
    };
    function d3_layout_stackX(d) {
      return d.x;
    }
    function d3_layout_stackY(d) {
      return d.y;
    }
    function d3_layout_stackOut(d, y0, y) {
      d.y0 = y0;
      d.y = y;
    }
    var d3_layout_stackOrders = d3.map({
        'inside-out': function (data) {
          var n = data.length, i, j, max = data.map(d3_layout_stackMaxIndex), sums = data.map(d3_layout_stackReduceSum), index = d3.range(n).sort(function (a, b) {
              return max[a] - max[b];
            }), top = 0, bottom = 0, tops = [], bottoms = [];
          for (i = 0; i < n; ++i) {
            j = index[i];
            if (top < bottom) {
              top += sums[j];
              tops.push(j);
            } else {
              bottom += sums[j];
              bottoms.push(j);
            }
          }
          return bottoms.reverse().concat(tops);
        },
        reverse: function (data) {
          return d3.range(data.length).reverse();
        },
        'default': d3_layout_stackOrderDefault
      });
    var d3_layout_stackOffsets = d3.map({
        silhouette: function (data) {
          var n = data.length, m = data[0].length, sums = [], max = 0, i, j, o, y0 = [];
          for (j = 0; j < m; ++j) {
            for (i = 0, o = 0; i < n; i++)
              o += data[i][j][1];
            if (o > max)
              max = o;
            sums.push(o);
          }
          for (j = 0; j < m; ++j) {
            y0[j] = (max - sums[j]) / 2;
          }
          return y0;
        },
        wiggle: function (data) {
          var n = data.length, x = data[0], m = x.length, i, j, k, s1, s2, s3, dx, o, o0, y0 = [];
          y0[0] = o = o0 = 0;
          for (j = 1; j < m; ++j) {
            for (i = 0, s1 = 0; i < n; ++i)
              s1 += data[i][j][1];
            for (i = 0, s2 = 0, dx = x[j][0] - x[j - 1][0]; i < n; ++i) {
              for (k = 0, s3 = (data[i][j][1] - data[i][j - 1][1]) / (2 * dx); k < i; ++k) {
                s3 += (data[k][j][1] - data[k][j - 1][1]) / dx;
              }
              s2 += s3 * data[i][j][1];
            }
            y0[j] = o -= s1 ? s2 / s1 * dx : 0;
            if (o < o0)
              o0 = o;
          }
          for (j = 0; j < m; ++j)
            y0[j] -= o0;
          return y0;
        },
        expand: function (data) {
          var n = data.length, m = data[0].length, k = 1 / n, i, j, o, y0 = [];
          for (j = 0; j < m; ++j) {
            for (i = 0, o = 0; i < n; i++)
              o += data[i][j][1];
            if (o)
              for (i = 0; i < n; i++)
                data[i][j][1] /= o;
            else
              for (i = 0; i < n; i++)
                data[i][j][1] = k;
          }
          for (j = 0; j < m; ++j)
            y0[j] = 0;
          return y0;
        },
        zero: d3_layout_stackOffsetZero
      });
    function d3_layout_stackOrderDefault(data) {
      return d3.range(data.length);
    }
    function d3_layout_stackOffsetZero(data) {
      var j = -1, m = data[0].length, y0 = [];
      while (++j < m)
        y0[j] = 0;
      return y0;
    }
    function d3_layout_stackMaxIndex(array) {
      var i = 1, j = 0, v = array[0][1], k, n = array.length;
      for (; i < n; ++i) {
        if ((k = array[i][1]) > v) {
          j = i;
          v = k;
        }
      }
      return j;
    }
    function d3_layout_stackReduceSum(d) {
      return d.reduce(d3_layout_stackSum, 0);
    }
    function d3_layout_stackSum(p, d) {
      return p + d[1];
    }
    d3.layout.histogram = function () {
      var frequency = true, valuer = Number, ranger = d3_layout_histogramRange, binner = d3_layout_histogramBinSturges;
      function histogram(data, i) {
        var bins = [], values = data.map(valuer, this), range = ranger.call(this, values, i), thresholds = binner.call(this, range, values, i), bin, i = -1, n = values.length, m = thresholds.length - 1, k = frequency ? 1 : 1 / n, x;
        while (++i < m) {
          bin = bins[i] = [];
          bin.dx = thresholds[i + 1] - (bin.x = thresholds[i]);
          bin.y = 0;
        }
        if (m > 0) {
          i = -1;
          while (++i < n) {
            x = values[i];
            if (x >= range[0] && x <= range[1]) {
              bin = bins[d3.bisect(thresholds, x, 1, m) - 1];
              bin.y += k;
              bin.push(data[i]);
            }
          }
        }
        return bins;
      }
      histogram.value = function (x) {
        if (!arguments.length)
          return valuer;
        valuer = x;
        return histogram;
      };
      histogram.range = function (x) {
        if (!arguments.length)
          return ranger;
        ranger = d3_functor(x);
        return histogram;
      };
      histogram.bins = function (x) {
        if (!arguments.length)
          return binner;
        binner = typeof x === 'number' ? function (range) {
          return d3_layout_histogramBinFixed(range, x);
        } : d3_functor(x);
        return histogram;
      };
      histogram.frequency = function (x) {
        if (!arguments.length)
          return frequency;
        frequency = !!x;
        return histogram;
      };
      return histogram;
    };
    function d3_layout_histogramBinSturges(range, values) {
      return d3_layout_histogramBinFixed(range, Math.ceil(Math.log(values.length) / Math.LN2 + 1));
    }
    function d3_layout_histogramBinFixed(range, n) {
      var x = -1, b = +range[0], m = (range[1] - b) / n, f = [];
      while (++x <= n)
        f[x] = m * x + b;
      return f;
    }
    function d3_layout_histogramRange(values) {
      return [
        d3.min(values),
        d3.max(values)
      ];
    }
    d3.layout.tree = function () {
      var hierarchy = d3.layout.hierarchy().sort(null).value(null), separation = d3_layout_treeSeparation, size = [
          1,
          1
        ], nodeSize = false;
      function tree(d, i) {
        var nodes = hierarchy.call(this, d, i), root = nodes[0];
        function firstWalk(node, previousSibling) {
          var children = node.children, layout = node._tree;
          if (children && (n = children.length)) {
            var n, firstChild = children[0], previousChild, ancestor = firstChild, child, i = -1;
            while (++i < n) {
              child = children[i];
              firstWalk(child, previousChild);
              ancestor = apportion(child, previousChild, ancestor);
              previousChild = child;
            }
            d3_layout_treeShift(node);
            var midpoint = 0.5 * (firstChild._tree.prelim + child._tree.prelim);
            if (previousSibling) {
              layout.prelim = previousSibling._tree.prelim + separation(node, previousSibling);
              layout.mod = layout.prelim - midpoint;
            } else {
              layout.prelim = midpoint;
            }
          } else {
            if (previousSibling) {
              layout.prelim = previousSibling._tree.prelim + separation(node, previousSibling);
            }
          }
        }
        function secondWalk(node, x) {
          node.x = node._tree.prelim + x;
          var children = node.children;
          if (children && (n = children.length)) {
            var i = -1, n;
            x += node._tree.mod;
            while (++i < n) {
              secondWalk(children[i], x);
            }
          }
        }
        function apportion(node, previousSibling, ancestor) {
          if (previousSibling) {
            var vip = node, vop = node, vim = previousSibling, vom = node.parent.children[0], sip = vip._tree.mod, sop = vop._tree.mod, sim = vim._tree.mod, som = vom._tree.mod, shift;
            while (vim = d3_layout_treeRight(vim), vip = d3_layout_treeLeft(vip), vim && vip) {
              vom = d3_layout_treeLeft(vom);
              vop = d3_layout_treeRight(vop);
              vop._tree.ancestor = node;
              shift = vim._tree.prelim + sim - vip._tree.prelim - sip + separation(vim, vip);
              if (shift > 0) {
                d3_layout_treeMove(d3_layout_treeAncestor(vim, node, ancestor), node, shift);
                sip += shift;
                sop += shift;
              }
              sim += vim._tree.mod;
              sip += vip._tree.mod;
              som += vom._tree.mod;
              sop += vop._tree.mod;
            }
            if (vim && !d3_layout_treeRight(vop)) {
              vop._tree.thread = vim;
              vop._tree.mod += sim - sop;
            }
            if (vip && !d3_layout_treeLeft(vom)) {
              vom._tree.thread = vip;
              vom._tree.mod += sip - som;
              ancestor = node;
            }
          }
          return ancestor;
        }
        d3_layout_treeVisitAfter(root, function (node, previousSibling) {
          node._tree = {
            ancestor: node,
            prelim: 0,
            mod: 0,
            change: 0,
            shift: 0,
            number: previousSibling ? previousSibling._tree.number + 1 : 0
          };
        });
        firstWalk(root);
        secondWalk(root, -root._tree.prelim);
        var left = d3_layout_treeSearch(root, d3_layout_treeLeftmost), right = d3_layout_treeSearch(root, d3_layout_treeRightmost), deep = d3_layout_treeSearch(root, d3_layout_treeDeepest), x0 = left.x - separation(left, right) / 2, x1 = right.x + separation(right, left) / 2, y1 = deep.depth || 1;
        d3_layout_treeVisitAfter(root, nodeSize ? function (node) {
          node.x *= size[0];
          node.y = node.depth * size[1];
          delete node._tree;
        } : function (node) {
          node.x = (node.x - x0) / (x1 - x0) * size[0];
          node.y = node.depth / y1 * size[1];
          delete node._tree;
        });
        return nodes;
      }
      tree.separation = function (x) {
        if (!arguments.length)
          return separation;
        separation = x;
        return tree;
      };
      tree.size = function (x) {
        if (!arguments.length)
          return nodeSize ? null : size;
        nodeSize = (size = x) == null;
        return tree;
      };
      tree.nodeSize = function (x) {
        if (!arguments.length)
          return nodeSize ? size : null;
        nodeSize = (size = x) != null;
        return tree;
      };
      return d3_layout_hierarchyRebind(tree, hierarchy);
    };
    function d3_layout_treeSeparation(a, b) {
      return a.parent == b.parent ? 1 : 2;
    }
    function d3_layout_treeLeft(node) {
      var children = node.children;
      return children && children.length ? children[0] : node._tree.thread;
    }
    function d3_layout_treeRight(node) {
      var children = node.children, n;
      return children && (n = children.length) ? children[n - 1] : node._tree.thread;
    }
    function d3_layout_treeSearch(node, compare) {
      var children = node.children;
      if (children && (n = children.length)) {
        var child, n, i = -1;
        while (++i < n) {
          if (compare(child = d3_layout_treeSearch(children[i], compare), node) > 0) {
            node = child;
          }
        }
      }
      return node;
    }
    function d3_layout_treeRightmost(a, b) {
      return a.x - b.x;
    }
    function d3_layout_treeLeftmost(a, b) {
      return b.x - a.x;
    }
    function d3_layout_treeDeepest(a, b) {
      return a.depth - b.depth;
    }
    function d3_layout_treeVisitAfter(node, callback) {
      function visit(node, previousSibling) {
        var children = node.children;
        if (children && (n = children.length)) {
          var child, previousChild = null, i = -1, n;
          while (++i < n) {
            child = children[i];
            visit(child, previousChild);
            previousChild = child;
          }
        }
        callback(node, previousSibling);
      }
      visit(node, null);
    }
    function d3_layout_treeShift(node) {
      var shift = 0, change = 0, children = node.children, i = children.length, child;
      while (--i >= 0) {
        child = children[i]._tree;
        child.prelim += shift;
        child.mod += shift;
        shift += child.shift + (change += child.change);
      }
    }
    function d3_layout_treeMove(ancestor, node, shift) {
      ancestor = ancestor._tree;
      node = node._tree;
      var change = shift / (node.number - ancestor.number);
      ancestor.change += change;
      node.change -= change;
      node.shift += shift;
      node.prelim += shift;
      node.mod += shift;
    }
    function d3_layout_treeAncestor(vim, node, ancestor) {
      return vim._tree.ancestor.parent == node.parent ? vim._tree.ancestor : ancestor;
    }
    d3.layout.pack = function () {
      var hierarchy = d3.layout.hierarchy().sort(d3_layout_packSort), padding = 0, size = [
          1,
          1
        ], radius;
      function pack(d, i) {
        var nodes = hierarchy.call(this, d, i), root = nodes[0], w = size[0], h = size[1], r = radius == null ? Math.sqrt : typeof radius === 'function' ? radius : function () {
            return radius;
          };
        root.x = root.y = 0;
        d3_layout_treeVisitAfter(root, function (d) {
          d.r = +r(d.value);
        });
        d3_layout_treeVisitAfter(root, d3_layout_packSiblings);
        if (padding) {
          var dr = padding * (radius ? 1 : Math.max(2 * root.r / w, 2 * root.r / h)) / 2;
          d3_layout_treeVisitAfter(root, function (d) {
            d.r += dr;
          });
          d3_layout_treeVisitAfter(root, d3_layout_packSiblings);
          d3_layout_treeVisitAfter(root, function (d) {
            d.r -= dr;
          });
        }
        d3_layout_packTransform(root, w / 2, h / 2, radius ? 1 : 1 / Math.max(2 * root.r / w, 2 * root.r / h));
        return nodes;
      }
      pack.size = function (_) {
        if (!arguments.length)
          return size;
        size = _;
        return pack;
      };
      pack.radius = function (_) {
        if (!arguments.length)
          return radius;
        radius = _ == null || typeof _ === 'function' ? _ : +_;
        return pack;
      };
      pack.padding = function (_) {
        if (!arguments.length)
          return padding;
        padding = +_;
        return pack;
      };
      return d3_layout_hierarchyRebind(pack, hierarchy);
    };
    function d3_layout_packSort(a, b) {
      return a.value - b.value;
    }
    function d3_layout_packInsert(a, b) {
      var c = a._pack_next;
      a._pack_next = b;
      b._pack_prev = a;
      b._pack_next = c;
      c._pack_prev = b;
    }
    function d3_layout_packSplice(a, b) {
      a._pack_next = b;
      b._pack_prev = a;
    }
    function d3_layout_packIntersects(a, b) {
      var dx = b.x - a.x, dy = b.y - a.y, dr = a.r + b.r;
      return 0.999 * dr * dr > dx * dx + dy * dy;
    }
    function d3_layout_packSiblings(node) {
      if (!(nodes = node.children) || !(n = nodes.length))
        return;
      var nodes, xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity, a, b, c, i, j, k, n;
      function bound(node) {
        xMin = Math.min(node.x - node.r, xMin);
        xMax = Math.max(node.x + node.r, xMax);
        yMin = Math.min(node.y - node.r, yMin);
        yMax = Math.max(node.y + node.r, yMax);
      }
      nodes.forEach(d3_layout_packLink);
      a = nodes[0];
      a.x = -a.r;
      a.y = 0;
      bound(a);
      if (n > 1) {
        b = nodes[1];
        b.x = b.r;
        b.y = 0;
        bound(b);
        if (n > 2) {
          c = nodes[2];
          d3_layout_packPlace(a, b, c);
          bound(c);
          d3_layout_packInsert(a, c);
          a._pack_prev = c;
          d3_layout_packInsert(c, b);
          b = a._pack_next;
          for (i = 3; i < n; i++) {
            d3_layout_packPlace(a, b, c = nodes[i]);
            var isect = 0, s1 = 1, s2 = 1;
            for (j = b._pack_next; j !== b; j = j._pack_next, s1++) {
              if (d3_layout_packIntersects(j, c)) {
                isect = 1;
                break;
              }
            }
            if (isect == 1) {
              for (k = a._pack_prev; k !== j._pack_prev; k = k._pack_prev, s2++) {
                if (d3_layout_packIntersects(k, c)) {
                  break;
                }
              }
            }
            if (isect) {
              if (s1 < s2 || s1 == s2 && b.r < a.r)
                d3_layout_packSplice(a, b = j);
              else
                d3_layout_packSplice(a = k, b);
              i--;
            } else {
              d3_layout_packInsert(a, c);
              b = c;
              bound(c);
            }
          }
        }
      }
      var cx = (xMin + xMax) / 2, cy = (yMin + yMax) / 2, cr = 0;
      for (i = 0; i < n; i++) {
        c = nodes[i];
        c.x -= cx;
        c.y -= cy;
        cr = Math.max(cr, c.r + Math.sqrt(c.x * c.x + c.y * c.y));
      }
      node.r = cr;
      nodes.forEach(d3_layout_packUnlink);
    }
    function d3_layout_packLink(node) {
      node._pack_next = node._pack_prev = node;
    }
    function d3_layout_packUnlink(node) {
      delete node._pack_next;
      delete node._pack_prev;
    }
    function d3_layout_packTransform(node, x, y, k) {
      var children = node.children;
      node.x = x += k * node.x;
      node.y = y += k * node.y;
      node.r *= k;
      if (children) {
        var i = -1, n = children.length;
        while (++i < n)
          d3_layout_packTransform(children[i], x, y, k);
      }
    }
    function d3_layout_packPlace(a, b, c) {
      var db = a.r + c.r, dx = b.x - a.x, dy = b.y - a.y;
      if (db && (dx || dy)) {
        var da = b.r + c.r, dc = dx * dx + dy * dy;
        da *= da;
        db *= db;
        var x = 0.5 + (db - da) / (2 * dc), y = Math.sqrt(Math.max(0, 2 * da * (db + dc) - (db -= dc) * db - da * da)) / (2 * dc);
        c.x = a.x + x * dx + y * dy;
        c.y = a.y + x * dy - y * dx;
      } else {
        c.x = a.x + db;
        c.y = a.y;
      }
    }
    d3.layout.cluster = function () {
      var hierarchy = d3.layout.hierarchy().sort(null).value(null), separation = d3_layout_treeSeparation, size = [
          1,
          1
        ], nodeSize = false;
      function cluster(d, i) {
        var nodes = hierarchy.call(this, d, i), root = nodes[0], previousNode, x = 0;
        d3_layout_treeVisitAfter(root, function (node) {
          var children = node.children;
          if (children && children.length) {
            node.x = d3_layout_clusterX(children);
            node.y = d3_layout_clusterY(children);
          } else {
            node.x = previousNode ? x += separation(node, previousNode) : 0;
            node.y = 0;
            previousNode = node;
          }
        });
        var left = d3_layout_clusterLeft(root), right = d3_layout_clusterRight(root), x0 = left.x - separation(left, right) / 2, x1 = right.x + separation(right, left) / 2;
        d3_layout_treeVisitAfter(root, nodeSize ? function (node) {
          node.x = (node.x - root.x) * size[0];
          node.y = (root.y - node.y) * size[1];
        } : function (node) {
          node.x = (node.x - x0) / (x1 - x0) * size[0];
          node.y = (1 - (root.y ? node.y / root.y : 1)) * size[1];
        });
        return nodes;
      }
      cluster.separation = function (x) {
        if (!arguments.length)
          return separation;
        separation = x;
        return cluster;
      };
      cluster.size = function (x) {
        if (!arguments.length)
          return nodeSize ? null : size;
        nodeSize = (size = x) == null;
        return cluster;
      };
      cluster.nodeSize = function (x) {
        if (!arguments.length)
          return nodeSize ? size : null;
        nodeSize = (size = x) != null;
        return cluster;
      };
      return d3_layout_hierarchyRebind(cluster, hierarchy);
    };
    function d3_layout_clusterY(children) {
      return 1 + d3.max(children, function (child) {
        return child.y;
      });
    }
    function d3_layout_clusterX(children) {
      return children.reduce(function (x, child) {
        return x + child.x;
      }, 0) / children.length;
    }
    function d3_layout_clusterLeft(node) {
      var children = node.children;
      return children && children.length ? d3_layout_clusterLeft(children[0]) : node;
    }
    function d3_layout_clusterRight(node) {
      var children = node.children, n;
      return children && (n = children.length) ? d3_layout_clusterRight(children[n - 1]) : node;
    }
    d3.layout.treemap = function () {
      var hierarchy = d3.layout.hierarchy(), round = Math.round, size = [
          1,
          1
        ], padding = null, pad = d3_layout_treemapPadNull, sticky = false, stickies, mode = 'squarify', ratio = 0.5 * (1 + Math.sqrt(5));
      function scale(children, k) {
        var i = -1, n = children.length, child, area;
        while (++i < n) {
          area = (child = children[i]).value * (k < 0 ? 0 : k);
          child.area = isNaN(area) || area <= 0 ? 0 : area;
        }
      }
      function squarify(node) {
        var children = node.children;
        if (children && children.length) {
          var rect = pad(node), row = [], remaining = children.slice(), child, best = Infinity, score, u = mode === 'slice' ? rect.dx : mode === 'dice' ? rect.dy : mode === 'slice-dice' ? node.depth & 1 ? rect.dy : rect.dx : Math.min(rect.dx, rect.dy), n;
          scale(remaining, rect.dx * rect.dy / node.value);
          row.area = 0;
          while ((n = remaining.length) > 0) {
            row.push(child = remaining[n - 1]);
            row.area += child.area;
            if (mode !== 'squarify' || (score = worst(row, u)) <= best) {
              remaining.pop();
              best = score;
            } else {
              row.area -= row.pop().area;
              position(row, u, rect, false);
              u = Math.min(rect.dx, rect.dy);
              row.length = row.area = 0;
              best = Infinity;
            }
          }
          if (row.length) {
            position(row, u, rect, true);
            row.length = row.area = 0;
          }
          children.forEach(squarify);
        }
      }
      function stickify(node) {
        var children = node.children;
        if (children && children.length) {
          var rect = pad(node), remaining = children.slice(), child, row = [];
          scale(remaining, rect.dx * rect.dy / node.value);
          row.area = 0;
          while (child = remaining.pop()) {
            row.push(child);
            row.area += child.area;
            if (child.z != null) {
              position(row, child.z ? rect.dx : rect.dy, rect, !remaining.length);
              row.length = row.area = 0;
            }
          }
          children.forEach(stickify);
        }
      }
      function worst(row, u) {
        var s = row.area, r, rmax = 0, rmin = Infinity, i = -1, n = row.length;
        while (++i < n) {
          if (!(r = row[i].area))
            continue;
          if (r < rmin)
            rmin = r;
          if (r > rmax)
            rmax = r;
        }
        s *= s;
        u *= u;
        return s ? Math.max(u * rmax * ratio / s, s / (u * rmin * ratio)) : Infinity;
      }
      function position(row, u, rect, flush) {
        var i = -1, n = row.length, x = rect.x, y = rect.y, v = u ? round(row.area / u) : 0, o;
        if (u == rect.dx) {
          if (flush || v > rect.dy)
            v = rect.dy;
          while (++i < n) {
            o = row[i];
            o.x = x;
            o.y = y;
            o.dy = v;
            x += o.dx = Math.min(rect.x + rect.dx - x, v ? round(o.area / v) : 0);
          }
          o.z = true;
          o.dx += rect.x + rect.dx - x;
          rect.y += v;
          rect.dy -= v;
        } else {
          if (flush || v > rect.dx)
            v = rect.dx;
          while (++i < n) {
            o = row[i];
            o.x = x;
            o.y = y;
            o.dx = v;
            y += o.dy = Math.min(rect.y + rect.dy - y, v ? round(o.area / v) : 0);
          }
          o.z = false;
          o.dy += rect.y + rect.dy - y;
          rect.x += v;
          rect.dx -= v;
        }
      }
      function treemap(d) {
        var nodes = stickies || hierarchy(d), root = nodes[0];
        root.x = 0;
        root.y = 0;
        root.dx = size[0];
        root.dy = size[1];
        if (stickies)
          hierarchy.revalue(root);
        scale([root], root.dx * root.dy / root.value);
        (stickies ? stickify : squarify)(root);
        if (sticky)
          stickies = nodes;
        return nodes;
      }
      treemap.size = function (x) {
        if (!arguments.length)
          return size;
        size = x;
        return treemap;
      };
      treemap.padding = function (x) {
        if (!arguments.length)
          return padding;
        function padFunction(node) {
          var p = x.call(treemap, node, node.depth);
          return p == null ? d3_layout_treemapPadNull(node) : d3_layout_treemapPad(node, typeof p === 'number' ? [
            p,
            p,
            p,
            p
          ] : p);
        }
        function padConstant(node) {
          return d3_layout_treemapPad(node, x);
        }
        var type;
        pad = (padding = x) == null ? d3_layout_treemapPadNull : (type = typeof x) === 'function' ? padFunction : type === 'number' ? (x = [
          x,
          x,
          x,
          x
        ], padConstant) : padConstant;
        return treemap;
      };
      treemap.round = function (x) {
        if (!arguments.length)
          return round != Number;
        round = x ? Math.round : Number;
        return treemap;
      };
      treemap.sticky = function (x) {
        if (!arguments.length)
          return sticky;
        sticky = x;
        stickies = null;
        return treemap;
      };
      treemap.ratio = function (x) {
        if (!arguments.length)
          return ratio;
        ratio = x;
        return treemap;
      };
      treemap.mode = function (x) {
        if (!arguments.length)
          return mode;
        mode = x + '';
        return treemap;
      };
      return d3_layout_hierarchyRebind(treemap, hierarchy);
    };
    function d3_layout_treemapPadNull(node) {
      return {
        x: node.x,
        y: node.y,
        dx: node.dx,
        dy: node.dy
      };
    }
    function d3_layout_treemapPad(node, padding) {
      var x = node.x + padding[3], y = node.y + padding[0], dx = node.dx - padding[1] - padding[3], dy = node.dy - padding[0] - padding[2];
      if (dx < 0) {
        x += dx / 2;
        dx = 0;
      }
      if (dy < 0) {
        y += dy / 2;
        dy = 0;
      }
      return {
        x: x,
        y: y,
        dx: dx,
        dy: dy
      };
    }
    d3.random = {
      normal: function (µ, σ) {
        var n = arguments.length;
        if (n < 2)
          σ = 1;
        if (n < 1)
          µ = 0;
        return function () {
          var x, y, r;
          do {
            x = Math.random() * 2 - 1;
            y = Math.random() * 2 - 1;
            r = x * x + y * y;
          } while (!r || r > 1);
          return µ + σ * x * Math.sqrt(-2 * Math.log(r) / r);
        };
      },
      logNormal: function () {
        var random = d3.random.normal.apply(d3, arguments);
        return function () {
          return Math.exp(random());
        };
      },
      irwinHall: function (m) {
        return function () {
          for (var s = 0, j = 0; j < m; j++)
            s += Math.random();
          return s / m;
        };
      }
    };
    d3.scale = {};
    function d3_scaleExtent(domain) {
      var start = domain[0], stop = domain[domain.length - 1];
      return start < stop ? [
        start,
        stop
      ] : [
        stop,
        start
      ];
    }
    function d3_scaleRange(scale) {
      return scale.rangeExtent ? scale.rangeExtent() : d3_scaleExtent(scale.range());
    }
    function d3_scale_bilinear(domain, range, uninterpolate, interpolate) {
      var u = uninterpolate(domain[0], domain[1]), i = interpolate(range[0], range[1]);
      return function (x) {
        return i(u(x));
      };
    }
    function d3_scale_nice(domain, nice) {
      var i0 = 0, i1 = domain.length - 1, x0 = domain[i0], x1 = domain[i1], dx;
      if (x1 < x0) {
        dx = i0, i0 = i1, i1 = dx;
        dx = x0, x0 = x1, x1 = dx;
      }
      domain[i0] = nice.floor(x0);
      domain[i1] = nice.ceil(x1);
      return domain;
    }
    function d3_scale_niceStep(step) {
      return step ? {
        floor: function (x) {
          return Math.floor(x / step) * step;
        },
        ceil: function (x) {
          return Math.ceil(x / step) * step;
        }
      } : d3_scale_niceIdentity;
    }
    var d3_scale_niceIdentity = {
        floor: d3_identity,
        ceil: d3_identity
      };
    function d3_scale_polylinear(domain, range, uninterpolate, interpolate) {
      var u = [], i = [], j = 0, k = Math.min(domain.length, range.length) - 1;
      if (domain[k] < domain[0]) {
        domain = domain.slice().reverse();
        range = range.slice().reverse();
      }
      while (++j <= k) {
        u.push(uninterpolate(domain[j - 1], domain[j]));
        i.push(interpolate(range[j - 1], range[j]));
      }
      return function (x) {
        var j = d3.bisect(domain, x, 1, k) - 1;
        return i[j](u[j](x));
      };
    }
    d3.scale.linear = function () {
      return d3_scale_linear([
        0,
        1
      ], [
        0,
        1
      ], d3_interpolate, false);
    };
    function d3_scale_linear(domain, range, interpolate, clamp) {
      var output, input;
      function rescale() {
        var linear = Math.min(domain.length, range.length) > 2 ? d3_scale_polylinear : d3_scale_bilinear, uninterpolate = clamp ? d3_uninterpolateClamp : d3_uninterpolateNumber;
        output = linear(domain, range, uninterpolate, interpolate);
        input = linear(range, domain, uninterpolate, d3_interpolate);
        return scale;
      }
      function scale(x) {
        return output(x);
      }
      scale.invert = function (y) {
        return input(y);
      };
      scale.domain = function (x) {
        if (!arguments.length)
          return domain;
        domain = x.map(Number);
        return rescale();
      };
      scale.range = function (x) {
        if (!arguments.length)
          return range;
        range = x;
        return rescale();
      };
      scale.rangeRound = function (x) {
        return scale.range(x).interpolate(d3_interpolateRound);
      };
      scale.clamp = function (x) {
        if (!arguments.length)
          return clamp;
        clamp = x;
        return rescale();
      };
      scale.interpolate = function (x) {
        if (!arguments.length)
          return interpolate;
        interpolate = x;
        return rescale();
      };
      scale.ticks = function (m) {
        return d3_scale_linearTicks(domain, m);
      };
      scale.tickFormat = function (m, format) {
        return d3_scale_linearTickFormat(domain, m, format);
      };
      scale.nice = function (m) {
        d3_scale_linearNice(domain, m);
        return rescale();
      };
      scale.copy = function () {
        return d3_scale_linear(domain, range, interpolate, clamp);
      };
      return rescale();
    }
    function d3_scale_linearRebind(scale, linear) {
      return d3.rebind(scale, linear, 'range', 'rangeRound', 'interpolate', 'clamp');
    }
    function d3_scale_linearNice(domain, m) {
      return d3_scale_nice(domain, d3_scale_niceStep(d3_scale_linearTickRange(domain, m)[2]));
    }
    function d3_scale_linearTickRange(domain, m) {
      if (m == null)
        m = 10;
      var extent = d3_scaleExtent(domain), span = extent[1] - extent[0], step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10)), err = m / span * step;
      if (err <= 0.15)
        step *= 10;
      else if (err <= 0.35)
        step *= 5;
      else if (err <= 0.75)
        step *= 2;
      extent[0] = Math.ceil(extent[0] / step) * step;
      extent[1] = Math.floor(extent[1] / step) * step + step * 0.5;
      extent[2] = step;
      return extent;
    }
    function d3_scale_linearTicks(domain, m) {
      return d3.range.apply(d3, d3_scale_linearTickRange(domain, m));
    }
    function d3_scale_linearTickFormat(domain, m, format) {
      var precision = -Math.floor(Math.log(d3_scale_linearTickRange(domain, m)[2]) / Math.LN10 + 0.01);
      return d3.format(format ? format.replace(d3_format_re, function (a, b, c, d, e, f, g, h, i, j) {
        return [
          b,
          c,
          d,
          e,
          f,
          g,
          h,
          i || '.' + (precision - (j === '%') * 2),
          j
        ].join('');
      }) : ',.' + precision + 'f');
    }
    d3.scale.log = function () {
      return d3_scale_log(d3.scale.linear().domain([
        0,
        1
      ]), 10, true, [
        1,
        10
      ]);
    };
    function d3_scale_log(linear, base, positive, domain) {
      function log(x) {
        return (positive ? Math.log(x < 0 ? 0 : x) : -Math.log(x > 0 ? 0 : -x)) / Math.log(base);
      }
      function pow(x) {
        return positive ? Math.pow(base, x) : -Math.pow(base, -x);
      }
      function scale(x) {
        return linear(log(x));
      }
      scale.invert = function (x) {
        return pow(linear.invert(x));
      };
      scale.domain = function (x) {
        if (!arguments.length)
          return domain;
        positive = x[0] >= 0;
        linear.domain((domain = x.map(Number)).map(log));
        return scale;
      };
      scale.base = function (_) {
        if (!arguments.length)
          return base;
        base = +_;
        linear.domain(domain.map(log));
        return scale;
      };
      scale.nice = function () {
        var niced = d3_scale_nice(domain.map(log), positive ? Math : d3_scale_logNiceNegative);
        linear.domain(niced);
        domain = niced.map(pow);
        return scale;
      };
      scale.ticks = function () {
        var extent = d3_scaleExtent(domain), ticks = [], u = extent[0], v = extent[1], i = Math.floor(log(u)), j = Math.ceil(log(v)), n = base % 1 ? 2 : base;
        if (isFinite(j - i)) {
          if (positive) {
            for (; i < j; i++)
              for (var k = 1; k < n; k++)
                ticks.push(pow(i) * k);
            ticks.push(pow(i));
          } else {
            ticks.push(pow(i));
            for (; i++ < j;)
              for (var k = n - 1; k > 0; k--)
                ticks.push(pow(i) * k);
          }
          for (i = 0; ticks[i] < u; i++) {
          }
          for (j = ticks.length; ticks[j - 1] > v; j--) {
          }
          ticks = ticks.slice(i, j);
        }
        return ticks;
      };
      scale.tickFormat = function (n, format) {
        if (!arguments.length)
          return d3_scale_logFormat;
        if (arguments.length < 2)
          format = d3_scale_logFormat;
        else if (typeof format !== 'function')
          format = d3.format(format);
        var k = Math.max(0.1, n / scale.ticks().length), f = positive ? (e = 1e-12, Math.ceil) : (e = -1e-12, Math.floor), e;
        return function (d) {
          return d / pow(f(log(d) + e)) <= k ? format(d) : '';
        };
      };
      scale.copy = function () {
        return d3_scale_log(linear.copy(), base, positive, domain);
      };
      return d3_scale_linearRebind(scale, linear);
    }
    var d3_scale_logFormat = d3.format('.0e'), d3_scale_logNiceNegative = {
        floor: function (x) {
          return -Math.ceil(-x);
        },
        ceil: function (x) {
          return -Math.floor(-x);
        }
      };
    d3.scale.pow = function () {
      return d3_scale_pow(d3.scale.linear(), 1, [
        0,
        1
      ]);
    };
    function d3_scale_pow(linear, exponent, domain) {
      var powp = d3_scale_powPow(exponent), powb = d3_scale_powPow(1 / exponent);
      function scale(x) {
        return linear(powp(x));
      }
      scale.invert = function (x) {
        return powb(linear.invert(x));
      };
      scale.domain = function (x) {
        if (!arguments.length)
          return domain;
        linear.domain((domain = x.map(Number)).map(powp));
        return scale;
      };
      scale.ticks = function (m) {
        return d3_scale_linearTicks(domain, m);
      };
      scale.tickFormat = function (m, format) {
        return d3_scale_linearTickFormat(domain, m, format);
      };
      scale.nice = function (m) {
        return scale.domain(d3_scale_linearNice(domain, m));
      };
      scale.exponent = function (x) {
        if (!arguments.length)
          return exponent;
        powp = d3_scale_powPow(exponent = x);
        powb = d3_scale_powPow(1 / exponent);
        linear.domain(domain.map(powp));
        return scale;
      };
      scale.copy = function () {
        return d3_scale_pow(linear.copy(), exponent, domain);
      };
      return d3_scale_linearRebind(scale, linear);
    }
    function d3_scale_powPow(e) {
      return function (x) {
        return x < 0 ? -Math.pow(-x, e) : Math.pow(x, e);
      };
    }
    d3.scale.sqrt = function () {
      return d3.scale.pow().exponent(0.5);
    };
    d3.scale.ordinal = function () {
      return d3_scale_ordinal([], {
        t: 'range',
        a: [[]]
      });
    };
    function d3_scale_ordinal(domain, ranger) {
      var index, range, rangeBand;
      function scale(x) {
        return range[((index.get(x) || ranger.t === 'range' && index.set(x, domain.push(x))) - 1) % range.length];
      }
      function steps(start, step) {
        return d3.range(domain.length).map(function (i) {
          return start + step * i;
        });
      }
      scale.domain = function (x) {
        if (!arguments.length)
          return domain;
        domain = [];
        index = new d3_Map();
        var i = -1, n = x.length, xi;
        while (++i < n)
          if (!index.has(xi = x[i]))
            index.set(xi, domain.push(xi));
        return scale[ranger.t].apply(scale, ranger.a);
      };
      scale.range = function (x) {
        if (!arguments.length)
          return range;
        range = x;
        rangeBand = 0;
        ranger = {
          t: 'range',
          a: arguments
        };
        return scale;
      };
      scale.rangePoints = function (x, padding) {
        if (arguments.length < 2)
          padding = 0;
        var start = x[0], stop = x[1], step = (stop - start) / (Math.max(1, domain.length - 1) + padding);
        range = steps(domain.length < 2 ? (start + stop) / 2 : start + step * padding / 2, step);
        rangeBand = 0;
        ranger = {
          t: 'rangePoints',
          a: arguments
        };
        return scale;
      };
      scale.rangeBands = function (x, padding, outerPadding) {
        if (arguments.length < 2)
          padding = 0;
        if (arguments.length < 3)
          outerPadding = padding;
        var reverse = x[1] < x[0], start = x[reverse - 0], stop = x[1 - reverse], step = (stop - start) / (domain.length - padding + 2 * outerPadding);
        range = steps(start + step * outerPadding, step);
        if (reverse)
          range.reverse();
        rangeBand = step * (1 - padding);
        ranger = {
          t: 'rangeBands',
          a: arguments
        };
        return scale;
      };
      scale.rangeRoundBands = function (x, padding, outerPadding) {
        if (arguments.length < 2)
          padding = 0;
        if (arguments.length < 3)
          outerPadding = padding;
        var reverse = x[1] < x[0], start = x[reverse - 0], stop = x[1 - reverse], step = Math.floor((stop - start) / (domain.length - padding + 2 * outerPadding)), error = stop - start - (domain.length - padding) * step;
        range = steps(start + Math.round(error / 2), step);
        if (reverse)
          range.reverse();
        rangeBand = Math.round(step * (1 - padding));
        ranger = {
          t: 'rangeRoundBands',
          a: arguments
        };
        return scale;
      };
      scale.rangeBand = function () {
        return rangeBand;
      };
      scale.rangeExtent = function () {
        return d3_scaleExtent(ranger.a[0]);
      };
      scale.copy = function () {
        return d3_scale_ordinal(domain, ranger);
      };
      return scale.domain(domain);
    }
    d3.scale.category10 = function () {
      return d3.scale.ordinal().range(d3_category10);
    };
    d3.scale.category20 = function () {
      return d3.scale.ordinal().range(d3_category20);
    };
    d3.scale.category20b = function () {
      return d3.scale.ordinal().range(d3_category20b);
    };
    d3.scale.category20c = function () {
      return d3.scale.ordinal().range(d3_category20c);
    };
    var d3_category10 = [
        2062260,
        16744206,
        2924588,
        14034728,
        9725885,
        9197131,
        14907330,
        8355711,
        12369186,
        1556175
      ].map(d3_rgbString);
    var d3_category20 = [
        2062260,
        11454440,
        16744206,
        16759672,
        2924588,
        10018698,
        14034728,
        16750742,
        9725885,
        12955861,
        9197131,
        12885140,
        14907330,
        16234194,
        8355711,
        13092807,
        12369186,
        14408589,
        1556175,
        10410725
      ].map(d3_rgbString);
    var d3_category20b = [
        3750777,
        5395619,
        7040719,
        10264286,
        6519097,
        9216594,
        11915115,
        13556636,
        9202993,
        12426809,
        15186514,
        15190932,
        8666169,
        11356490,
        14049643,
        15177372,
        8077683,
        10834324,
        13528509,
        14589654
      ].map(d3_rgbString);
    var d3_category20c = [
        3244733,
        7057110,
        10406625,
        13032431,
        15095053,
        16616764,
        16625259,
        16634018,
        3253076,
        7652470,
        10607003,
        13101504,
        7695281,
        10394312,
        12369372,
        14342891,
        6513507,
        9868950,
        12434877,
        14277081
      ].map(d3_rgbString);
    d3.scale.quantile = function () {
      return d3_scale_quantile([], []);
    };
    function d3_scale_quantile(domain, range) {
      var thresholds;
      function rescale() {
        var k = 0, q = range.length;
        thresholds = [];
        while (++k < q)
          thresholds[k - 1] = d3.quantile(domain, k / q);
        return scale;
      }
      function scale(x) {
        if (!isNaN(x = +x))
          return range[d3.bisect(thresholds, x)];
      }
      scale.domain = function (x) {
        if (!arguments.length)
          return domain;
        domain = x.filter(function (d) {
          return !isNaN(d);
        }).sort(d3.ascending);
        return rescale();
      };
      scale.range = function (x) {
        if (!arguments.length)
          return range;
        range = x;
        return rescale();
      };
      scale.quantiles = function () {
        return thresholds;
      };
      scale.invertExtent = function (y) {
        y = range.indexOf(y);
        return y < 0 ? [
          NaN,
          NaN
        ] : [
          y > 0 ? thresholds[y - 1] : domain[0],
          y < thresholds.length ? thresholds[y] : domain[domain.length - 1]
        ];
      };
      scale.copy = function () {
        return d3_scale_quantile(domain, range);
      };
      return rescale();
    }
    d3.scale.quantize = function () {
      return d3_scale_quantize(0, 1, [
        0,
        1
      ]);
    };
    function d3_scale_quantize(x0, x1, range) {
      var kx, i;
      function scale(x) {
        return range[Math.max(0, Math.min(i, Math.floor(kx * (x - x0))))];
      }
      function rescale() {
        kx = range.length / (x1 - x0);
        i = range.length - 1;
        return scale;
      }
      scale.domain = function (x) {
        if (!arguments.length)
          return [
            x0,
            x1
          ];
        x0 = +x[0];
        x1 = +x[x.length - 1];
        return rescale();
      };
      scale.range = function (x) {
        if (!arguments.length)
          return range;
        range = x;
        return rescale();
      };
      scale.invertExtent = function (y) {
        y = range.indexOf(y);
        y = y < 0 ? NaN : y / kx + x0;
        return [
          y,
          y + 1 / kx
        ];
      };
      scale.copy = function () {
        return d3_scale_quantize(x0, x1, range);
      };
      return rescale();
    }
    d3.scale.threshold = function () {
      return d3_scale_threshold([0.5], [
        0,
        1
      ]);
    };
    function d3_scale_threshold(domain, range) {
      function scale(x) {
        if (x <= x)
          return range[d3.bisect(domain, x)];
      }
      scale.domain = function (_) {
        if (!arguments.length)
          return domain;
        domain = _;
        return scale;
      };
      scale.range = function (_) {
        if (!arguments.length)
          return range;
        range = _;
        return scale;
      };
      scale.invertExtent = function (y) {
        y = range.indexOf(y);
        return [
          domain[y - 1],
          domain[y]
        ];
      };
      scale.copy = function () {
        return d3_scale_threshold(domain, range);
      };
      return scale;
    }
    d3.scale.identity = function () {
      return d3_scale_identity([
        0,
        1
      ]);
    };
    function d3_scale_identity(domain) {
      function identity(x) {
        return +x;
      }
      identity.invert = identity;
      identity.domain = identity.range = function (x) {
        if (!arguments.length)
          return domain;
        domain = x.map(identity);
        return identity;
      };
      identity.ticks = function (m) {
        return d3_scale_linearTicks(domain, m);
      };
      identity.tickFormat = function (m, format) {
        return d3_scale_linearTickFormat(domain, m, format);
      };
      identity.copy = function () {
        return d3_scale_identity(domain);
      };
      return identity;
    }
    d3.svg.arc = function () {
      var innerRadius = d3_svg_arcInnerRadius, outerRadius = d3_svg_arcOuterRadius, startAngle = d3_svg_arcStartAngle, endAngle = d3_svg_arcEndAngle;
      function arc() {
        var r0 = innerRadius.apply(this, arguments), r1 = outerRadius.apply(this, arguments), a0 = startAngle.apply(this, arguments) + d3_svg_arcOffset, a1 = endAngle.apply(this, arguments) + d3_svg_arcOffset, da = (a1 < a0 && (da = a0, a0 = a1, a1 = da), a1 - a0), df = da < π ? '0' : '1', c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
        return da >= d3_svg_arcMax ? r0 ? 'M0,' + r1 + 'A' + r1 + ',' + r1 + ' 0 1,1 0,' + -r1 + 'A' + r1 + ',' + r1 + ' 0 1,1 0,' + r1 + 'M0,' + r0 + 'A' + r0 + ',' + r0 + ' 0 1,0 0,' + -r0 + 'A' + r0 + ',' + r0 + ' 0 1,0 0,' + r0 + 'Z' : 'M0,' + r1 + 'A' + r1 + ',' + r1 + ' 0 1,1 0,' + -r1 + 'A' + r1 + ',' + r1 + ' 0 1,1 0,' + r1 + 'Z' : r0 ? 'M' + r1 * c0 + ',' + r1 * s0 + 'A' + r1 + ',' + r1 + ' 0 ' + df + ',1 ' + r1 * c1 + ',' + r1 * s1 + 'L' + r0 * c1 + ',' + r0 * s1 + 'A' + r0 + ',' + r0 + ' 0 ' + df + ',0 ' + r0 * c0 + ',' + r0 * s0 + 'Z' : 'M' + r1 * c0 + ',' + r1 * s0 + 'A' + r1 + ',' + r1 + ' 0 ' + df + ',1 ' + r1 * c1 + ',' + r1 * s1 + 'L0,0' + 'Z';
      }
      arc.innerRadius = function (v) {
        if (!arguments.length)
          return innerRadius;
        innerRadius = d3_functor(v);
        return arc;
      };
      arc.outerRadius = function (v) {
        if (!arguments.length)
          return outerRadius;
        outerRadius = d3_functor(v);
        return arc;
      };
      arc.startAngle = function (v) {
        if (!arguments.length)
          return startAngle;
        startAngle = d3_functor(v);
        return arc;
      };
      arc.endAngle = function (v) {
        if (!arguments.length)
          return endAngle;
        endAngle = d3_functor(v);
        return arc;
      };
      arc.centroid = function () {
        var r = (innerRadius.apply(this, arguments) + outerRadius.apply(this, arguments)) / 2, a = (startAngle.apply(this, arguments) + endAngle.apply(this, arguments)) / 2 + d3_svg_arcOffset;
        return [
          Math.cos(a) * r,
          Math.sin(a) * r
        ];
      };
      return arc;
    };
    var d3_svg_arcOffset = -halfπ, d3_svg_arcMax = τ - ε;
    function d3_svg_arcInnerRadius(d) {
      return d.innerRadius;
    }
    function d3_svg_arcOuterRadius(d) {
      return d.outerRadius;
    }
    function d3_svg_arcStartAngle(d) {
      return d.startAngle;
    }
    function d3_svg_arcEndAngle(d) {
      return d.endAngle;
    }
    d3.svg.line.radial = function () {
      var line = d3_svg_line(d3_svg_lineRadial);
      line.radius = line.x, delete line.x;
      line.angle = line.y, delete line.y;
      return line;
    };
    function d3_svg_lineRadial(points) {
      var point, i = -1, n = points.length, r, a;
      while (++i < n) {
        point = points[i];
        r = point[0];
        a = point[1] + d3_svg_arcOffset;
        point[0] = r * Math.cos(a);
        point[1] = r * Math.sin(a);
      }
      return points;
    }
    function d3_svg_area(projection) {
      var x0 = d3_svg_lineX, x1 = d3_svg_lineX, y0 = 0, y1 = d3_svg_lineY, defined = d3_true, interpolate = d3_svg_lineLinear, interpolateKey = interpolate.key, interpolateReverse = interpolate, L = 'L', tension = 0.7;
      function area(data) {
        var segments = [], points0 = [], points1 = [], i = -1, n = data.length, d, fx0 = d3_functor(x0), fy0 = d3_functor(y0), fx1 = x0 === x1 ? function () {
            return x;
          } : d3_functor(x1), fy1 = y0 === y1 ? function () {
            return y;
          } : d3_functor(y1), x, y;
        function segment() {
          segments.push('M', interpolate(projection(points1), tension), L, interpolateReverse(projection(points0.reverse()), tension), 'Z');
        }
        while (++i < n) {
          if (defined.call(this, d = data[i], i)) {
            points0.push([
              x = +fx0.call(this, d, i),
              y = +fy0.call(this, d, i)
            ]);
            points1.push([
              +fx1.call(this, d, i),
              +fy1.call(this, d, i)
            ]);
          } else if (points0.length) {
            segment();
            points0 = [];
            points1 = [];
          }
        }
        if (points0.length)
          segment();
        return segments.length ? segments.join('') : null;
      }
      area.x = function (_) {
        if (!arguments.length)
          return x1;
        x0 = x1 = _;
        return area;
      };
      area.x0 = function (_) {
        if (!arguments.length)
          return x0;
        x0 = _;
        return area;
      };
      area.x1 = function (_) {
        if (!arguments.length)
          return x1;
        x1 = _;
        return area;
      };
      area.y = function (_) {
        if (!arguments.length)
          return y1;
        y0 = y1 = _;
        return area;
      };
      area.y0 = function (_) {
        if (!arguments.length)
          return y0;
        y0 = _;
        return area;
      };
      area.y1 = function (_) {
        if (!arguments.length)
          return y1;
        y1 = _;
        return area;
      };
      area.defined = function (_) {
        if (!arguments.length)
          return defined;
        defined = _;
        return area;
      };
      area.interpolate = function (_) {
        if (!arguments.length)
          return interpolateKey;
        if (typeof _ === 'function')
          interpolateKey = interpolate = _;
        else
          interpolateKey = (interpolate = d3_svg_lineInterpolators.get(_) || d3_svg_lineLinear).key;
        interpolateReverse = interpolate.reverse || interpolate;
        L = interpolate.closed ? 'M' : 'L';
        return area;
      };
      area.tension = function (_) {
        if (!arguments.length)
          return tension;
        tension = _;
        return area;
      };
      return area;
    }
    d3_svg_lineStepBefore.reverse = d3_svg_lineStepAfter;
    d3_svg_lineStepAfter.reverse = d3_svg_lineStepBefore;
    d3.svg.area = function () {
      return d3_svg_area(d3_identity);
    };
    d3.svg.area.radial = function () {
      var area = d3_svg_area(d3_svg_lineRadial);
      area.radius = area.x, delete area.x;
      area.innerRadius = area.x0, delete area.x0;
      area.outerRadius = area.x1, delete area.x1;
      area.angle = area.y, delete area.y;
      area.startAngle = area.y0, delete area.y0;
      area.endAngle = area.y1, delete area.y1;
      return area;
    };
    d3.svg.chord = function () {
      var source = d3_source, target = d3_target, radius = d3_svg_chordRadius, startAngle = d3_svg_arcStartAngle, endAngle = d3_svg_arcEndAngle;
      function chord(d, i) {
        var s = subgroup(this, source, d, i), t = subgroup(this, target, d, i);
        return 'M' + s.p0 + arc(s.r, s.p1, s.a1 - s.a0) + (equals(s, t) ? curve(s.r, s.p1, s.r, s.p0) : curve(s.r, s.p1, t.r, t.p0) + arc(t.r, t.p1, t.a1 - t.a0) + curve(t.r, t.p1, s.r, s.p0)) + 'Z';
      }
      function subgroup(self, f, d, i) {
        var subgroup = f.call(self, d, i), r = radius.call(self, subgroup, i), a0 = startAngle.call(self, subgroup, i) + d3_svg_arcOffset, a1 = endAngle.call(self, subgroup, i) + d3_svg_arcOffset;
        return {
          r: r,
          a0: a0,
          a1: a1,
          p0: [
            r * Math.cos(a0),
            r * Math.sin(a0)
          ],
          p1: [
            r * Math.cos(a1),
            r * Math.sin(a1)
          ]
        };
      }
      function equals(a, b) {
        return a.a0 == b.a0 && a.a1 == b.a1;
      }
      function arc(r, p, a) {
        return 'A' + r + ',' + r + ' 0 ' + +(a > π) + ',1 ' + p;
      }
      function curve(r0, p0, r1, p1) {
        return 'Q 0,0 ' + p1;
      }
      chord.radius = function (v) {
        if (!arguments.length)
          return radius;
        radius = d3_functor(v);
        return chord;
      };
      chord.source = function (v) {
        if (!arguments.length)
          return source;
        source = d3_functor(v);
        return chord;
      };
      chord.target = function (v) {
        if (!arguments.length)
          return target;
        target = d3_functor(v);
        return chord;
      };
      chord.startAngle = function (v) {
        if (!arguments.length)
          return startAngle;
        startAngle = d3_functor(v);
        return chord;
      };
      chord.endAngle = function (v) {
        if (!arguments.length)
          return endAngle;
        endAngle = d3_functor(v);
        return chord;
      };
      return chord;
    };
    function d3_svg_chordRadius(d) {
      return d.radius;
    }
    d3.svg.diagonal = function () {
      var source = d3_source, target = d3_target, projection = d3_svg_diagonalProjection;
      function diagonal(d, i) {
        var p0 = source.call(this, d, i), p3 = target.call(this, d, i), m = (p0.y + p3.y) / 2, p = [
            p0,
            {
              x: p0.x,
              y: m
            },
            {
              x: p3.x,
              y: m
            },
            p3
          ];
        p = p.map(projection);
        return 'M' + p[0] + 'C' + p[1] + ' ' + p[2] + ' ' + p[3];
      }
      diagonal.source = function (x) {
        if (!arguments.length)
          return source;
        source = d3_functor(x);
        return diagonal;
      };
      diagonal.target = function (x) {
        if (!arguments.length)
          return target;
        target = d3_functor(x);
        return diagonal;
      };
      diagonal.projection = function (x) {
        if (!arguments.length)
          return projection;
        projection = x;
        return diagonal;
      };
      return diagonal;
    };
    function d3_svg_diagonalProjection(d) {
      return [
        d.x,
        d.y
      ];
    }
    d3.svg.diagonal.radial = function () {
      var diagonal = d3.svg.diagonal(), projection = d3_svg_diagonalProjection, projection_ = diagonal.projection;
      diagonal.projection = function (x) {
        return arguments.length ? projection_(d3_svg_diagonalRadialProjection(projection = x)) : projection;
      };
      return diagonal;
    };
    function d3_svg_diagonalRadialProjection(projection) {
      return function () {
        var d = projection.apply(this, arguments), r = d[0], a = d[1] + d3_svg_arcOffset;
        return [
          r * Math.cos(a),
          r * Math.sin(a)
        ];
      };
    }
    d3.svg.symbol = function () {
      var type = d3_svg_symbolType, size = d3_svg_symbolSize;
      function symbol(d, i) {
        return (d3_svg_symbols.get(type.call(this, d, i)) || d3_svg_symbolCircle)(size.call(this, d, i));
      }
      symbol.type = function (x) {
        if (!arguments.length)
          return type;
        type = d3_functor(x);
        return symbol;
      };
      symbol.size = function (x) {
        if (!arguments.length)
          return size;
        size = d3_functor(x);
        return symbol;
      };
      return symbol;
    };
    function d3_svg_symbolSize() {
      return 64;
    }
    function d3_svg_symbolType() {
      return 'circle';
    }
    function d3_svg_symbolCircle(size) {
      var r = Math.sqrt(size / π);
      return 'M0,' + r + 'A' + r + ',' + r + ' 0 1,1 0,' + -r + 'A' + r + ',' + r + ' 0 1,1 0,' + r + 'Z';
    }
    var d3_svg_symbols = d3.map({
        circle: d3_svg_symbolCircle,
        cross: function (size) {
          var r = Math.sqrt(size / 5) / 2;
          return 'M' + -3 * r + ',' + -r + 'H' + -r + 'V' + -3 * r + 'H' + r + 'V' + -r + 'H' + 3 * r + 'V' + r + 'H' + r + 'V' + 3 * r + 'H' + -r + 'V' + r + 'H' + -3 * r + 'Z';
        },
        diamond: function (size) {
          var ry = Math.sqrt(size / (2 * d3_svg_symbolTan30)), rx = ry * d3_svg_symbolTan30;
          return 'M0,' + -ry + 'L' + rx + ',0' + ' 0,' + ry + ' ' + -rx + ',0' + 'Z';
        },
        square: function (size) {
          var r = Math.sqrt(size) / 2;
          return 'M' + -r + ',' + -r + 'L' + r + ',' + -r + ' ' + r + ',' + r + ' ' + -r + ',' + r + 'Z';
        },
        'triangle-down': function (size) {
          var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
          return 'M0,' + ry + 'L' + rx + ',' + -ry + ' ' + -rx + ',' + -ry + 'Z';
        },
        'triangle-up': function (size) {
          var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
          return 'M0,' + -ry + 'L' + rx + ',' + ry + ' ' + -rx + ',' + ry + 'Z';
        }
      });
    d3.svg.symbolTypes = d3_svg_symbols.keys();
    var d3_svg_symbolSqrt3 = Math.sqrt(3), d3_svg_symbolTan30 = Math.tan(30 * d3_radians);
    function d3_transition(groups, id) {
      d3_subclass(groups, d3_transitionPrototype);
      groups.id = id;
      return groups;
    }
    var d3_transitionPrototype = [], d3_transitionId = 0, d3_transitionInheritId, d3_transitionInherit;
    d3_transitionPrototype.call = d3_selectionPrototype.call;
    d3_transitionPrototype.empty = d3_selectionPrototype.empty;
    d3_transitionPrototype.node = d3_selectionPrototype.node;
    d3_transitionPrototype.size = d3_selectionPrototype.size;
    d3.transition = function (selection) {
      return arguments.length ? d3_transitionInheritId ? selection.transition() : selection : d3_selectionRoot.transition();
    };
    d3.transition.prototype = d3_transitionPrototype;
    d3_transitionPrototype.select = function (selector) {
      var id = this.id, subgroups = [], subgroup, subnode, node;
      selector = d3_selection_selector(selector);
      for (var j = -1, m = this.length; ++j < m;) {
        subgroups.push(subgroup = []);
        for (var group = this[j], i = -1, n = group.length; ++i < n;) {
          if ((node = group[i]) && (subnode = selector.call(node, node.__data__, i, j))) {
            if ('__data__' in node)
              subnode.__data__ = node.__data__;
            d3_transitionNode(subnode, i, id, node.__transition__[id]);
            subgroup.push(subnode);
          } else {
            subgroup.push(null);
          }
        }
      }
      return d3_transition(subgroups, id);
    };
    d3_transitionPrototype.selectAll = function (selector) {
      var id = this.id, subgroups = [], subgroup, subnodes, node, subnode, transition;
      selector = d3_selection_selectorAll(selector);
      for (var j = -1, m = this.length; ++j < m;) {
        for (var group = this[j], i = -1, n = group.length; ++i < n;) {
          if (node = group[i]) {
            transition = node.__transition__[id];
            subnodes = selector.call(node, node.__data__, i, j);
            subgroups.push(subgroup = []);
            for (var k = -1, o = subnodes.length; ++k < o;) {
              if (subnode = subnodes[k])
                d3_transitionNode(subnode, k, id, transition);
              subgroup.push(subnode);
            }
          }
        }
      }
      return d3_transition(subgroups, id);
    };
    d3_transitionPrototype.filter = function (filter) {
      var subgroups = [], subgroup, group, node;
      if (typeof filter !== 'function')
        filter = d3_selection_filter(filter);
      for (var j = 0, m = this.length; j < m; j++) {
        subgroups.push(subgroup = []);
        for (var group = this[j], i = 0, n = group.length; i < n; i++) {
          if ((node = group[i]) && filter.call(node, node.__data__, i)) {
            subgroup.push(node);
          }
        }
      }
      return d3_transition(subgroups, this.id);
    };
    d3_transitionPrototype.tween = function (name, tween) {
      var id = this.id;
      if (arguments.length < 2)
        return this.node().__transition__[id].tween.get(name);
      return d3_selection_each(this, tween == null ? function (node) {
        node.__transition__[id].tween.remove(name);
      } : function (node) {
        node.__transition__[id].tween.set(name, tween);
      });
    };
    function d3_transition_tween(groups, name, value, tween) {
      var id = groups.id;
      return d3_selection_each(groups, typeof value === 'function' ? function (node, i, j) {
        node.__transition__[id].tween.set(name, tween(value.call(node, node.__data__, i, j)));
      } : (value = tween(value), function (node) {
        node.__transition__[id].tween.set(name, value);
      }));
    }
    d3_transitionPrototype.attr = function (nameNS, value) {
      if (arguments.length < 2) {
        for (value in nameNS)
          this.attr(value, nameNS[value]);
        return this;
      }
      var interpolate = nameNS == 'transform' ? d3_interpolateTransform : d3_interpolate, name = d3.ns.qualify(nameNS);
      function attrNull() {
        this.removeAttribute(name);
      }
      function attrNullNS() {
        this.removeAttributeNS(name.space, name.local);
      }
      function attrTween(b) {
        return b == null ? attrNull : (b += '', function () {
          var a = this.getAttribute(name), i;
          return a !== b && (i = interpolate(a, b), function (t) {
            this.setAttribute(name, i(t));
          });
        });
      }
      function attrTweenNS(b) {
        return b == null ? attrNullNS : (b += '', function () {
          var a = this.getAttributeNS(name.space, name.local), i;
          return a !== b && (i = interpolate(a, b), function (t) {
            this.setAttributeNS(name.space, name.local, i(t));
          });
        });
      }
      return d3_transition_tween(this, 'attr.' + nameNS, value, name.local ? attrTweenNS : attrTween);
    };
    d3_transitionPrototype.attrTween = function (nameNS, tween) {
      var name = d3.ns.qualify(nameNS);
      function attrTween(d, i) {
        var f = tween.call(this, d, i, this.getAttribute(name));
        return f && function (t) {
          this.setAttribute(name, f(t));
        };
      }
      function attrTweenNS(d, i) {
        var f = tween.call(this, d, i, this.getAttributeNS(name.space, name.local));
        return f && function (t) {
          this.setAttributeNS(name.space, name.local, f(t));
        };
      }
      return this.tween('attr.' + nameNS, name.local ? attrTweenNS : attrTween);
    };
    d3_transitionPrototype.style = function (name, value, priority) {
      var n = arguments.length;
      if (n < 3) {
        if (typeof name !== 'string') {
          if (n < 2)
            value = '';
          for (priority in name)
            this.style(priority, name[priority], value);
          return this;
        }
        priority = '';
      }
      function styleNull() {
        this.style.removeProperty(name);
      }
      function styleString(b) {
        return b == null ? styleNull : (b += '', function () {
          var a = d3_window.getComputedStyle(this, null).getPropertyValue(name), i;
          return a !== b && (i = d3_interpolate(a, b), function (t) {
            this.style.setProperty(name, i(t), priority);
          });
        });
      }
      return d3_transition_tween(this, 'style.' + name, value, styleString);
    };
    d3_transitionPrototype.styleTween = function (name, tween, priority) {
      if (arguments.length < 3)
        priority = '';
      function styleTween(d, i) {
        var f = tween.call(this, d, i, d3_window.getComputedStyle(this, null).getPropertyValue(name));
        return f && function (t) {
          this.style.setProperty(name, f(t), priority);
        };
      }
      return this.tween('style.' + name, styleTween);
    };
    d3_transitionPrototype.text = function (value) {
      return d3_transition_tween(this, 'text', value, d3_transition_text);
    };
    function d3_transition_text(b) {
      if (b == null)
        b = '';
      return function () {
        this.textContent = b;
      };
    }
    d3_transitionPrototype.remove = function () {
      return this.each('end.transition', function () {
        var p;
        if (this.__transition__.count < 2 && (p = this.parentNode))
          p.removeChild(this);
      });
    };
    d3_transitionPrototype.ease = function (value) {
      var id = this.id;
      if (arguments.length < 1)
        return this.node().__transition__[id].ease;
      if (typeof value !== 'function')
        value = d3.ease.apply(d3, arguments);
      return d3_selection_each(this, function (node) {
        node.__transition__[id].ease = value;
      });
    };
    d3_transitionPrototype.delay = function (value) {
      var id = this.id;
      return d3_selection_each(this, typeof value === 'function' ? function (node, i, j) {
        node.__transition__[id].delay = +value.call(node, node.__data__, i, j);
      } : (value = +value, function (node) {
        node.__transition__[id].delay = value;
      }));
    };
    d3_transitionPrototype.duration = function (value) {
      var id = this.id;
      return d3_selection_each(this, typeof value === 'function' ? function (node, i, j) {
        node.__transition__[id].duration = Math.max(1, value.call(node, node.__data__, i, j));
      } : (value = Math.max(1, value), function (node) {
        node.__transition__[id].duration = value;
      }));
    };
    d3_transitionPrototype.each = function (type, listener) {
      var id = this.id;
      if (arguments.length < 2) {
        var inherit = d3_transitionInherit, inheritId = d3_transitionInheritId;
        d3_transitionInheritId = id;
        d3_selection_each(this, function (node, i, j) {
          d3_transitionInherit = node.__transition__[id];
          type.call(node, node.__data__, i, j);
        });
        d3_transitionInherit = inherit;
        d3_transitionInheritId = inheritId;
      } else {
        d3_selection_each(this, function (node) {
          var transition = node.__transition__[id];
          (transition.event || (transition.event = d3.dispatch('start', 'end'))).on(type, listener);
        });
      }
      return this;
    };
    d3_transitionPrototype.transition = function () {
      var id0 = this.id, id1 = ++d3_transitionId, subgroups = [], subgroup, group, node, transition;
      for (var j = 0, m = this.length; j < m; j++) {
        subgroups.push(subgroup = []);
        for (var group = this[j], i = 0, n = group.length; i < n; i++) {
          if (node = group[i]) {
            transition = Object.create(node.__transition__[id0]);
            transition.delay += transition.duration;
            d3_transitionNode(node, i, id1, transition);
          }
          subgroup.push(node);
        }
      }
      return d3_transition(subgroups, id1);
    };
    function d3_transitionNode(node, i, id, inherit) {
      var lock = node.__transition__ || (node.__transition__ = {
          active: 0,
          count: 0
        }), transition = lock[id];
      if (!transition) {
        var time = inherit.time;
        transition = lock[id] = {
          tween: new d3_Map(),
          time: time,
          ease: inherit.ease,
          delay: inherit.delay,
          duration: inherit.duration
        };
        ++lock.count;
        d3.timer(function (elapsed) {
          var d = node.__data__, ease = transition.ease, delay = transition.delay, duration = transition.duration, tweened = [];
          if (delay <= elapsed)
            return start(elapsed - delay);
          d3_timer_replace(start, delay, time);
          function start(elapsed) {
            if (lock.active > id)
              return stop();
            lock.active = id;
            transition.event && transition.event.start.call(node, d, i);
            transition.tween.forEach(function (key, value) {
              if (value = value.call(node, d, i)) {
                tweened.push(value);
              }
            });
            if (tick(elapsed || 1))
              return 1;
            d3_timer_replace(tick, delay, time);
          }
          function tick(elapsed) {
            if (lock.active !== id)
              return stop();
            var t = elapsed / duration, e = ease(t), n = tweened.length;
            while (n > 0) {
              tweened[--n].call(node, e);
            }
            if (t >= 1) {
              transition.event && transition.event.end.call(node, d, i);
              return stop();
            }
          }
          function stop() {
            if (--lock.count)
              delete lock[id];
            else
              delete node.__transition__;
            return 1;
          }
        }, 0, time);
      }
    }
    d3.svg.axis = function () {
      var scale = d3.scale.linear(), orient = d3_svg_axisDefaultOrient, innerTickSize = 6, outerTickSize = 6, tickPadding = 3, tickArguments_ = [10], tickValues = null, tickFormat_;
      function axis(g) {
        g.each(function () {
          var g = d3.select(this);
          var scale0 = this.__chart__ || scale, scale1 = this.__chart__ = scale.copy();
          var ticks = tickValues == null ? scale1.ticks ? scale1.ticks.apply(scale1, tickArguments_) : scale1.domain() : tickValues, tickFormat = tickFormat_ == null ? scale1.tickFormat ? scale1.tickFormat.apply(scale1, tickArguments_) : d3_identity : tickFormat_, tick = g.selectAll('.tick').data(ticks, scale1), tickEnter = tick.enter().insert('g', '.domain').attr('class', 'tick').style('opacity', ε), tickExit = d3.transition(tick.exit()).style('opacity', ε).remove(), tickUpdate = d3.transition(tick).style('opacity', 1), tickTransform;
          var range = d3_scaleRange(scale1), path = g.selectAll('.domain').data([0]), pathUpdate = (path.enter().append('path').attr('class', 'domain'), d3.transition(path));
          tickEnter.append('line');
          tickEnter.append('text');
          var lineEnter = tickEnter.select('line'), lineUpdate = tickUpdate.select('line'), text = tick.select('text').text(tickFormat), textEnter = tickEnter.select('text'), textUpdate = tickUpdate.select('text');
          switch (orient) {
          case 'bottom': {
              tickTransform = d3_svg_axisX;
              lineEnter.attr('y2', innerTickSize);
              textEnter.attr('y', Math.max(innerTickSize, 0) + tickPadding);
              lineUpdate.attr('x2', 0).attr('y2', innerTickSize);
              textUpdate.attr('x', 0).attr('y', Math.max(innerTickSize, 0) + tickPadding);
              text.attr('dy', '.71em').style('text-anchor', 'middle');
              pathUpdate.attr('d', 'M' + range[0] + ',' + outerTickSize + 'V0H' + range[1] + 'V' + outerTickSize);
              break;
            }
          case 'top': {
              tickTransform = d3_svg_axisX;
              lineEnter.attr('y2', -innerTickSize);
              textEnter.attr('y', -(Math.max(innerTickSize, 0) + tickPadding));
              lineUpdate.attr('x2', 0).attr('y2', -innerTickSize);
              textUpdate.attr('x', 0).attr('y', -(Math.max(innerTickSize, 0) + tickPadding));
              text.attr('dy', '0em').style('text-anchor', 'middle');
              pathUpdate.attr('d', 'M' + range[0] + ',' + -outerTickSize + 'V0H' + range[1] + 'V' + -outerTickSize);
              break;
            }
          case 'left': {
              tickTransform = d3_svg_axisY;
              lineEnter.attr('x2', -innerTickSize);
              textEnter.attr('x', -(Math.max(innerTickSize, 0) + tickPadding));
              lineUpdate.attr('x2', -innerTickSize).attr('y2', 0);
              textUpdate.attr('x', -(Math.max(innerTickSize, 0) + tickPadding)).attr('y', 0);
              text.attr('dy', '.32em').style('text-anchor', 'end');
              pathUpdate.attr('d', 'M' + -outerTickSize + ',' + range[0] + 'H0V' + range[1] + 'H' + -outerTickSize);
              break;
            }
          case 'right': {
              tickTransform = d3_svg_axisY;
              lineEnter.attr('x2', innerTickSize);
              textEnter.attr('x', Math.max(innerTickSize, 0) + tickPadding);
              lineUpdate.attr('x2', innerTickSize).attr('y2', 0);
              textUpdate.attr('x', Math.max(innerTickSize, 0) + tickPadding).attr('y', 0);
              text.attr('dy', '.32em').style('text-anchor', 'start');
              pathUpdate.attr('d', 'M' + outerTickSize + ',' + range[0] + 'H0V' + range[1] + 'H' + outerTickSize);
              break;
            }
          }
          if (scale1.rangeBand) {
            var dx = scale1.rangeBand() / 2, x = function (d) {
                return scale1(d) + dx;
              };
            tickEnter.call(tickTransform, x);
            tickUpdate.call(tickTransform, x);
          } else {
            tickEnter.call(tickTransform, scale0);
            tickUpdate.call(tickTransform, scale1);
            tickExit.call(tickTransform, scale1);
          }
        });
      }
      axis.scale = function (x) {
        if (!arguments.length)
          return scale;
        scale = x;
        return axis;
      };
      axis.orient = function (x) {
        if (!arguments.length)
          return orient;
        orient = x in d3_svg_axisOrients ? x + '' : d3_svg_axisDefaultOrient;
        return axis;
      };
      axis.ticks = function () {
        if (!arguments.length)
          return tickArguments_;
        tickArguments_ = arguments;
        return axis;
      };
      axis.tickValues = function (x) {
        if (!arguments.length)
          return tickValues;
        tickValues = x;
        return axis;
      };
      axis.tickFormat = function (x) {
        if (!arguments.length)
          return tickFormat_;
        tickFormat_ = x;
        return axis;
      };
      axis.tickSize = function (x) {
        var n = arguments.length;
        if (!n)
          return innerTickSize;
        innerTickSize = +x;
        outerTickSize = +arguments[n - 1];
        return axis;
      };
      axis.innerTickSize = function (x) {
        if (!arguments.length)
          return innerTickSize;
        innerTickSize = +x;
        return axis;
      };
      axis.outerTickSize = function (x) {
        if (!arguments.length)
          return outerTickSize;
        outerTickSize = +x;
        return axis;
      };
      axis.tickPadding = function (x) {
        if (!arguments.length)
          return tickPadding;
        tickPadding = +x;
        return axis;
      };
      axis.tickSubdivide = function () {
        return arguments.length && axis;
      };
      return axis;
    };
    var d3_svg_axisDefaultOrient = 'bottom', d3_svg_axisOrients = {
        top: 1,
        right: 1,
        bottom: 1,
        left: 1
      };
    function d3_svg_axisX(selection, x) {
      selection.attr('transform', function (d) {
        return 'translate(' + x(d) + ',0)';
      });
    }
    function d3_svg_axisY(selection, y) {
      selection.attr('transform', function (d) {
        return 'translate(0,' + y(d) + ')';
      });
    }
    d3.svg.brush = function () {
      var event = d3_eventDispatch(brush, 'brushstart', 'brush', 'brushend'), x = null, y = null, xExtent = [
          0,
          0
        ], yExtent = [
          0,
          0
        ], xExtentDomain, yExtentDomain, xClamp = true, yClamp = true, resizes = d3_svg_brushResizes[0];
      function brush(g) {
        g.each(function () {
          var g = d3.select(this).style('pointer-events', 'all').style('-webkit-tap-highlight-color', 'rgba(0,0,0,0)').on('mousedown.brush', brushstart).on('touchstart.brush', brushstart);
          var background = g.selectAll('.background').data([0]);
          background.enter().append('rect').attr('class', 'background').style('visibility', 'hidden').style('cursor', 'crosshair');
          g.selectAll('.extent').data([0]).enter().append('rect').attr('class', 'extent').style('cursor', 'move');
          var resize = g.selectAll('.resize').data(resizes, d3_identity);
          resize.exit().remove();
          resize.enter().append('g').attr('class', function (d) {
            return 'resize ' + d;
          }).style('cursor', function (d) {
            return d3_svg_brushCursor[d];
          }).append('rect').attr('x', function (d) {
            return /[ew]$/.test(d) ? -3 : null;
          }).attr('y', function (d) {
            return /^[ns]/.test(d) ? -3 : null;
          }).attr('width', 6).attr('height', 6).style('visibility', 'hidden');
          resize.style('display', brush.empty() ? 'none' : null);
          var gUpdate = d3.transition(g), backgroundUpdate = d3.transition(background), range;
          if (x) {
            range = d3_scaleRange(x);
            backgroundUpdate.attr('x', range[0]).attr('width', range[1] - range[0]);
            redrawX(gUpdate);
          }
          if (y) {
            range = d3_scaleRange(y);
            backgroundUpdate.attr('y', range[0]).attr('height', range[1] - range[0]);
            redrawY(gUpdate);
          }
          redraw(gUpdate);
        });
      }
      brush.event = function (g) {
        g.each(function () {
          var event_ = event.of(this, arguments), extent1 = {
              x: xExtent,
              y: yExtent,
              i: xExtentDomain,
              j: yExtentDomain
            }, extent0 = this.__chart__ || extent1;
          this.__chart__ = extent1;
          if (d3_transitionInheritId) {
            d3.select(this).transition().each('start.brush', function () {
              xExtentDomain = extent0.i;
              yExtentDomain = extent0.j;
              xExtent = extent0.x;
              yExtent = extent0.y;
              event_({ type: 'brushstart' });
            }).tween('brush:brush', function () {
              var xi = d3_interpolateArray(xExtent, extent1.x), yi = d3_interpolateArray(yExtent, extent1.y);
              xExtentDomain = yExtentDomain = null;
              return function (t) {
                xExtent = extent1.x = xi(t);
                yExtent = extent1.y = yi(t);
                event_({
                  type: 'brush',
                  mode: 'resize'
                });
              };
            }).each('end.brush', function () {
              xExtentDomain = extent1.i;
              yExtentDomain = extent1.j;
              event_({
                type: 'brush',
                mode: 'resize'
              });
              event_({ type: 'brushend' });
            });
          } else {
            event_({ type: 'brushstart' });
            event_({
              type: 'brush',
              mode: 'resize'
            });
            event_({ type: 'brushend' });
          }
        });
      };
      function redraw(g) {
        g.selectAll('.resize').attr('transform', function (d) {
          return 'translate(' + xExtent[+/e$/.test(d)] + ',' + yExtent[+/^s/.test(d)] + ')';
        });
      }
      function redrawX(g) {
        g.select('.extent').attr('x', xExtent[0]);
        g.selectAll('.extent,.n>rect,.s>rect').attr('width', xExtent[1] - xExtent[0]);
      }
      function redrawY(g) {
        g.select('.extent').attr('y', yExtent[0]);
        g.selectAll('.extent,.e>rect,.w>rect').attr('height', yExtent[1] - yExtent[0]);
      }
      function brushstart() {
        var target = this, eventTarget = d3.select(d3.event.target), event_ = event.of(target, arguments), g = d3.select(target), resizing = eventTarget.datum(), resizingX = !/^(n|s)$/.test(resizing) && x, resizingY = !/^(e|w)$/.test(resizing) && y, dragging = eventTarget.classed('extent'), dragRestore = d3_event_dragSuppress(), center, origin = d3.mouse(target), offset;
        var w = d3.select(d3_window).on('keydown.brush', keydown).on('keyup.brush', keyup);
        if (d3.event.changedTouches) {
          w.on('touchmove.brush', brushmove).on('touchend.brush', brushend);
        } else {
          w.on('mousemove.brush', brushmove).on('mouseup.brush', brushend);
        }
        g.interrupt().selectAll('*').interrupt();
        if (dragging) {
          origin[0] = xExtent[0] - origin[0];
          origin[1] = yExtent[0] - origin[1];
        } else if (resizing) {
          var ex = +/w$/.test(resizing), ey = +/^n/.test(resizing);
          offset = [
            xExtent[1 - ex] - origin[0],
            yExtent[1 - ey] - origin[1]
          ];
          origin[0] = xExtent[ex];
          origin[1] = yExtent[ey];
        } else if (d3.event.altKey)
          center = origin.slice();
        g.style('pointer-events', 'none').selectAll('.resize').style('display', null);
        d3.select('body').style('cursor', eventTarget.style('cursor'));
        event_({ type: 'brushstart' });
        brushmove();
        function keydown() {
          if (d3.event.keyCode == 32) {
            if (!dragging) {
              center = null;
              origin[0] -= xExtent[1];
              origin[1] -= yExtent[1];
              dragging = 2;
            }
            d3_eventPreventDefault();
          }
        }
        function keyup() {
          if (d3.event.keyCode == 32 && dragging == 2) {
            origin[0] += xExtent[1];
            origin[1] += yExtent[1];
            dragging = 0;
            d3_eventPreventDefault();
          }
        }
        function brushmove() {
          var point = d3.mouse(target), moved = false;
          if (offset) {
            point[0] += offset[0];
            point[1] += offset[1];
          }
          if (!dragging) {
            if (d3.event.altKey) {
              if (!center)
                center = [
                  (xExtent[0] + xExtent[1]) / 2,
                  (yExtent[0] + yExtent[1]) / 2
                ];
              origin[0] = xExtent[+(point[0] < center[0])];
              origin[1] = yExtent[+(point[1] < center[1])];
            } else
              center = null;
          }
          if (resizingX && move1(point, x, 0)) {
            redrawX(g);
            moved = true;
          }
          if (resizingY && move1(point, y, 1)) {
            redrawY(g);
            moved = true;
          }
          if (moved) {
            redraw(g);
            event_({
              type: 'brush',
              mode: dragging ? 'move' : 'resize'
            });
          }
        }
        function move1(point, scale, i) {
          var range = d3_scaleRange(scale), r0 = range[0], r1 = range[1], position = origin[i], extent = i ? yExtent : xExtent, size = extent[1] - extent[0], min, max;
          if (dragging) {
            r0 -= position;
            r1 -= size + position;
          }
          min = (i ? yClamp : xClamp) ? Math.max(r0, Math.min(r1, point[i])) : point[i];
          if (dragging) {
            max = (min += position) + size;
          } else {
            if (center)
              position = Math.max(r0, Math.min(r1, 2 * center[i] - min));
            if (position < min) {
              max = min;
              min = position;
            } else {
              max = position;
            }
          }
          if (extent[0] != min || extent[1] != max) {
            if (i)
              yExtentDomain = null;
            else
              xExtentDomain = null;
            extent[0] = min;
            extent[1] = max;
            return true;
          }
        }
        function brushend() {
          brushmove();
          g.style('pointer-events', 'all').selectAll('.resize').style('display', brush.empty() ? 'none' : null);
          d3.select('body').style('cursor', null);
          w.on('mousemove.brush', null).on('mouseup.brush', null).on('touchmove.brush', null).on('touchend.brush', null).on('keydown.brush', null).on('keyup.brush', null);
          dragRestore();
          event_({ type: 'brushend' });
        }
      }
      brush.x = function (z) {
        if (!arguments.length)
          return x;
        x = z;
        resizes = d3_svg_brushResizes[!x << 1 | !y];
        return brush;
      };
      brush.y = function (z) {
        if (!arguments.length)
          return y;
        y = z;
        resizes = d3_svg_brushResizes[!x << 1 | !y];
        return brush;
      };
      brush.clamp = function (z) {
        if (!arguments.length)
          return x && y ? [
            xClamp,
            yClamp
          ] : x ? xClamp : y ? yClamp : null;
        if (x && y)
          xClamp = !!z[0], yClamp = !!z[1];
        else if (x)
          xClamp = !!z;
        else if (y)
          yClamp = !!z;
        return brush;
      };
      brush.extent = function (z) {
        var x0, x1, y0, y1, t;
        if (!arguments.length) {
          if (x) {
            if (xExtentDomain) {
              x0 = xExtentDomain[0], x1 = xExtentDomain[1];
            } else {
              x0 = xExtent[0], x1 = xExtent[1];
              if (x.invert)
                x0 = x.invert(x0), x1 = x.invert(x1);
              if (x1 < x0)
                t = x0, x0 = x1, x1 = t;
            }
          }
          if (y) {
            if (yExtentDomain) {
              y0 = yExtentDomain[0], y1 = yExtentDomain[1];
            } else {
              y0 = yExtent[0], y1 = yExtent[1];
              if (y.invert)
                y0 = y.invert(y0), y1 = y.invert(y1);
              if (y1 < y0)
                t = y0, y0 = y1, y1 = t;
            }
          }
          return x && y ? [
            [
              x0,
              y0
            ],
            [
              x1,
              y1
            ]
          ] : x ? [
            x0,
            x1
          ] : y && [
            y0,
            y1
          ];
        }
        if (x) {
          x0 = z[0], x1 = z[1];
          if (y)
            x0 = x0[0], x1 = x1[0];
          xExtentDomain = [
            x0,
            x1
          ];
          if (x.invert)
            x0 = x(x0), x1 = x(x1);
          if (x1 < x0)
            t = x0, x0 = x1, x1 = t;
          if (x0 != xExtent[0] || x1 != xExtent[1])
            xExtent = [
              x0,
              x1
            ];
        }
        if (y) {
          y0 = z[0], y1 = z[1];
          if (x)
            y0 = y0[1], y1 = y1[1];
          yExtentDomain = [
            y0,
            y1
          ];
          if (y.invert)
            y0 = y(y0), y1 = y(y1);
          if (y1 < y0)
            t = y0, y0 = y1, y1 = t;
          if (y0 != yExtent[0] || y1 != yExtent[1])
            yExtent = [
              y0,
              y1
            ];
        }
        return brush;
      };
      brush.clear = function () {
        if (!brush.empty()) {
          xExtent = [
            0,
            0
          ], yExtent = [
            0,
            0
          ];
          xExtentDomain = yExtentDomain = null;
        }
        return brush;
      };
      brush.empty = function () {
        return !!x && xExtent[0] == xExtent[1] || !!y && yExtent[0] == yExtent[1];
      };
      return d3.rebind(brush, event, 'on');
    };
    var d3_svg_brushCursor = {
        n: 'ns-resize',
        e: 'ew-resize',
        s: 'ns-resize',
        w: 'ew-resize',
        nw: 'nwse-resize',
        ne: 'nesw-resize',
        se: 'nwse-resize',
        sw: 'nesw-resize'
      };
    var d3_svg_brushResizes = [
        [
          'n',
          'e',
          's',
          'w',
          'nw',
          'ne',
          'se',
          'sw'
        ],
        [
          'e',
          'w'
        ],
        [
          'n',
          's'
        ],
        []
      ];
    var d3_time = d3.time = {}, d3_date = Date, d3_time_daySymbols = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ];
    function d3_date_utc() {
      this._ = new Date(arguments.length > 1 ? Date.UTC.apply(this, arguments) : arguments[0]);
    }
    d3_date_utc.prototype = {
      getDate: function () {
        return this._.getUTCDate();
      },
      getDay: function () {
        return this._.getUTCDay();
      },
      getFullYear: function () {
        return this._.getUTCFullYear();
      },
      getHours: function () {
        return this._.getUTCHours();
      },
      getMilliseconds: function () {
        return this._.getUTCMilliseconds();
      },
      getMinutes: function () {
        return this._.getUTCMinutes();
      },
      getMonth: function () {
        return this._.getUTCMonth();
      },
      getSeconds: function () {
        return this._.getUTCSeconds();
      },
      getTime: function () {
        return this._.getTime();
      },
      getTimezoneOffset: function () {
        return 0;
      },
      valueOf: function () {
        return this._.valueOf();
      },
      setDate: function () {
        d3_time_prototype.setUTCDate.apply(this._, arguments);
      },
      setDay: function () {
        d3_time_prototype.setUTCDay.apply(this._, arguments);
      },
      setFullYear: function () {
        d3_time_prototype.setUTCFullYear.apply(this._, arguments);
      },
      setHours: function () {
        d3_time_prototype.setUTCHours.apply(this._, arguments);
      },
      setMilliseconds: function () {
        d3_time_prototype.setUTCMilliseconds.apply(this._, arguments);
      },
      setMinutes: function () {
        d3_time_prototype.setUTCMinutes.apply(this._, arguments);
      },
      setMonth: function () {
        d3_time_prototype.setUTCMonth.apply(this._, arguments);
      },
      setSeconds: function () {
        d3_time_prototype.setUTCSeconds.apply(this._, arguments);
      },
      setTime: function () {
        d3_time_prototype.setTime.apply(this._, arguments);
      }
    };
    var d3_time_prototype = Date.prototype;
    var d3_time_formatDateTime = '%a %b %e %X %Y', d3_time_formatDate = '%m/%d/%Y', d3_time_formatTime = '%H:%M:%S';
    var d3_time_days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ], d3_time_dayAbbreviations = [
        'Sun',
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat'
      ], d3_time_months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ], d3_time_monthAbbreviations = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ];
    function d3_time_interval(local, step, number) {
      function round(date) {
        var d0 = local(date), d1 = offset(d0, 1);
        return date - d0 < d1 - date ? d0 : d1;
      }
      function ceil(date) {
        step(date = local(new d3_date(date - 1)), 1);
        return date;
      }
      function offset(date, k) {
        step(date = new d3_date(+date), k);
        return date;
      }
      function range(t0, t1, dt) {
        var time = ceil(t0), times = [];
        if (dt > 1) {
          while (time < t1) {
            if (!(number(time) % dt))
              times.push(new Date(+time));
            step(time, 1);
          }
        } else {
          while (time < t1)
            times.push(new Date(+time)), step(time, 1);
        }
        return times;
      }
      function range_utc(t0, t1, dt) {
        try {
          d3_date = d3_date_utc;
          var utc = new d3_date_utc();
          utc._ = t0;
          return range(utc, t1, dt);
        } finally {
          d3_date = Date;
        }
      }
      local.floor = local;
      local.round = round;
      local.ceil = ceil;
      local.offset = offset;
      local.range = range;
      var utc = local.utc = d3_time_interval_utc(local);
      utc.floor = utc;
      utc.round = d3_time_interval_utc(round);
      utc.ceil = d3_time_interval_utc(ceil);
      utc.offset = d3_time_interval_utc(offset);
      utc.range = range_utc;
      return local;
    }
    function d3_time_interval_utc(method) {
      return function (date, k) {
        try {
          d3_date = d3_date_utc;
          var utc = new d3_date_utc();
          utc._ = date;
          return method(utc, k)._;
        } finally {
          d3_date = Date;
        }
      };
    }
    d3_time.year = d3_time_interval(function (date) {
      date = d3_time.day(date);
      date.setMonth(0, 1);
      return date;
    }, function (date, offset) {
      date.setFullYear(date.getFullYear() + offset);
    }, function (date) {
      return date.getFullYear();
    });
    d3_time.years = d3_time.year.range;
    d3_time.years.utc = d3_time.year.utc.range;
    d3_time.day = d3_time_interval(function (date) {
      var day = new d3_date(2000, 0);
      day.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      return day;
    }, function (date, offset) {
      date.setDate(date.getDate() + offset);
    }, function (date) {
      return date.getDate() - 1;
    });
    d3_time.days = d3_time.day.range;
    d3_time.days.utc = d3_time.day.utc.range;
    d3_time.dayOfYear = function (date) {
      var year = d3_time.year(date);
      return Math.floor((date - year - (date.getTimezoneOffset() - year.getTimezoneOffset()) * 60000) / 86400000);
    };
    d3_time_daySymbols.forEach(function (day, i) {
      day = day.toLowerCase();
      i = 7 - i;
      var interval = d3_time[day] = d3_time_interval(function (date) {
          (date = d3_time.day(date)).setDate(date.getDate() - (date.getDay() + i) % 7);
          return date;
        }, function (date, offset) {
          date.setDate(date.getDate() + Math.floor(offset) * 7);
        }, function (date) {
          var day = d3_time.year(date).getDay();
          return Math.floor((d3_time.dayOfYear(date) + (day + i) % 7) / 7) - (day !== i);
        });
      d3_time[day + 's'] = interval.range;
      d3_time[day + 's'].utc = interval.utc.range;
      d3_time[day + 'OfYear'] = function (date) {
        var day = d3_time.year(date).getDay();
        return Math.floor((d3_time.dayOfYear(date) + (day + i) % 7) / 7);
      };
    });
    d3_time.week = d3_time.sunday;
    d3_time.weeks = d3_time.sunday.range;
    d3_time.weeks.utc = d3_time.sunday.utc.range;
    d3_time.weekOfYear = d3_time.sundayOfYear;
    d3_time.format = d3_time_format;
    function d3_time_format(template) {
      var n = template.length;
      function format(date) {
        var string = [], i = -1, j = 0, c, p, f;
        while (++i < n) {
          if (template.charCodeAt(i) === 37) {
            string.push(template.substring(j, i));
            if ((p = d3_time_formatPads[c = template.charAt(++i)]) != null)
              c = template.charAt(++i);
            if (f = d3_time_formats[c])
              c = f(date, p == null ? c === 'e' ? ' ' : '0' : p);
            string.push(c);
            j = i + 1;
          }
        }
        string.push(template.substring(j, i));
        return string.join('');
      }
      format.parse = function (string) {
        var d = {
            y: 1900,
            m: 0,
            d: 1,
            H: 0,
            M: 0,
            S: 0,
            L: 0,
            Z: null
          }, i = d3_time_parse(d, template, string, 0);
        if (i != string.length)
          return null;
        if ('p' in d)
          d.H = d.H % 12 + d.p * 12;
        var localZ = d.Z != null && d3_date !== d3_date_utc, date = new (localZ ? d3_date_utc : d3_date)();
        if ('j' in d)
          date.setFullYear(d.y, 0, d.j);
        else if ('w' in d && ('W' in d || 'U' in d)) {
          date.setFullYear(d.y, 0, 1);
          date.setFullYear(d.y, 0, 'W' in d ? (d.w + 6) % 7 + d.W * 7 - (date.getDay() + 5) % 7 : d.w + d.U * 7 - (date.getDay() + 6) % 7);
        } else
          date.setFullYear(d.y, d.m, d.d);
        date.setHours(d.H + Math.floor(d.Z / 100), d.M + d.Z % 100, d.S, d.L);
        return localZ ? date._ : date;
      };
      format.toString = function () {
        return template;
      };
      return format;
    }
    function d3_time_parse(date, template, string, j) {
      var c, p, t, i = 0, n = template.length, m = string.length;
      while (i < n) {
        if (j >= m)
          return -1;
        c = template.charCodeAt(i++);
        if (c === 37) {
          t = template.charAt(i++);
          p = d3_time_parsers[t in d3_time_formatPads ? template.charAt(i++) : t];
          if (!p || (j = p(date, string, j)) < 0)
            return -1;
        } else if (c != string.charCodeAt(j++)) {
          return -1;
        }
      }
      return j;
    }
    function d3_time_formatRe(names) {
      return new RegExp('^(?:' + names.map(d3.requote).join('|') + ')', 'i');
    }
    function d3_time_formatLookup(names) {
      var map = new d3_Map(), i = -1, n = names.length;
      while (++i < n)
        map.set(names[i].toLowerCase(), i);
      return map;
    }
    function d3_time_formatPad(value, fill, width) {
      var sign = value < 0 ? '-' : '', string = (sign ? -value : value) + '', length = string.length;
      return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
    }
    var d3_time_dayRe = d3_time_formatRe(d3_time_days), d3_time_dayLookup = d3_time_formatLookup(d3_time_days), d3_time_dayAbbrevRe = d3_time_formatRe(d3_time_dayAbbreviations), d3_time_dayAbbrevLookup = d3_time_formatLookup(d3_time_dayAbbreviations), d3_time_monthRe = d3_time_formatRe(d3_time_months), d3_time_monthLookup = d3_time_formatLookup(d3_time_months), d3_time_monthAbbrevRe = d3_time_formatRe(d3_time_monthAbbreviations), d3_time_monthAbbrevLookup = d3_time_formatLookup(d3_time_monthAbbreviations), d3_time_percentRe = /^%/;
    var d3_time_formatPads = {
        '-': '',
        _: ' ',
        '0': '0'
      };
    var d3_time_formats = {
        a: function (d) {
          return d3_time_dayAbbreviations[d.getDay()];
        },
        A: function (d) {
          return d3_time_days[d.getDay()];
        },
        b: function (d) {
          return d3_time_monthAbbreviations[d.getMonth()];
        },
        B: function (d) {
          return d3_time_months[d.getMonth()];
        },
        c: d3_time_format(d3_time_formatDateTime),
        d: function (d, p) {
          return d3_time_formatPad(d.getDate(), p, 2);
        },
        e: function (d, p) {
          return d3_time_formatPad(d.getDate(), p, 2);
        },
        H: function (d, p) {
          return d3_time_formatPad(d.getHours(), p, 2);
        },
        I: function (d, p) {
          return d3_time_formatPad(d.getHours() % 12 || 12, p, 2);
        },
        j: function (d, p) {
          return d3_time_formatPad(1 + d3_time.dayOfYear(d), p, 3);
        },
        L: function (d, p) {
          return d3_time_formatPad(d.getMilliseconds(), p, 3);
        },
        m: function (d, p) {
          return d3_time_formatPad(d.getMonth() + 1, p, 2);
        },
        M: function (d, p) {
          return d3_time_formatPad(d.getMinutes(), p, 2);
        },
        p: function (d) {
          return d.getHours() >= 12 ? 'PM' : 'AM';
        },
        S: function (d, p) {
          return d3_time_formatPad(d.getSeconds(), p, 2);
        },
        U: function (d, p) {
          return d3_time_formatPad(d3_time.sundayOfYear(d), p, 2);
        },
        w: function (d) {
          return d.getDay();
        },
        W: function (d, p) {
          return d3_time_formatPad(d3_time.mondayOfYear(d), p, 2);
        },
        x: d3_time_format(d3_time_formatDate),
        X: d3_time_format(d3_time_formatTime),
        y: function (d, p) {
          return d3_time_formatPad(d.getFullYear() % 100, p, 2);
        },
        Y: function (d, p) {
          return d3_time_formatPad(d.getFullYear() % 10000, p, 4);
        },
        Z: d3_time_zone,
        '%': function () {
          return '%';
        }
      };
    var d3_time_parsers = {
        a: d3_time_parseWeekdayAbbrev,
        A: d3_time_parseWeekday,
        b: d3_time_parseMonthAbbrev,
        B: d3_time_parseMonth,
        c: d3_time_parseLocaleFull,
        d: d3_time_parseDay,
        e: d3_time_parseDay,
        H: d3_time_parseHour24,
        I: d3_time_parseHour24,
        j: d3_time_parseDayOfYear,
        L: d3_time_parseMilliseconds,
        m: d3_time_parseMonthNumber,
        M: d3_time_parseMinutes,
        p: d3_time_parseAmPm,
        S: d3_time_parseSeconds,
        U: d3_time_parseWeekNumberSunday,
        w: d3_time_parseWeekdayNumber,
        W: d3_time_parseWeekNumberMonday,
        x: d3_time_parseLocaleDate,
        X: d3_time_parseLocaleTime,
        y: d3_time_parseYear,
        Y: d3_time_parseFullYear,
        Z: d3_time_parseZone,
        '%': d3_time_parseLiteralPercent
      };
    function d3_time_parseWeekdayAbbrev(date, string, i) {
      d3_time_dayAbbrevRe.lastIndex = 0;
      var n = d3_time_dayAbbrevRe.exec(string.substring(i));
      return n ? (date.w = d3_time_dayAbbrevLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function d3_time_parseWeekday(date, string, i) {
      d3_time_dayRe.lastIndex = 0;
      var n = d3_time_dayRe.exec(string.substring(i));
      return n ? (date.w = d3_time_dayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function d3_time_parseWeekdayNumber(date, string, i) {
      d3_time_numberRe.lastIndex = 0;
      var n = d3_time_numberRe.exec(string.substring(i, i + 1));
      return n ? (date.w = +n[0], i + n[0].length) : -1;
    }
    function d3_time_parseWeekNumberSunday(date, string, i) {
      d3_time_numberRe.lastIndex = 0;
      var n = d3_time_numberRe.exec(string.substring(i));
      return n ? (date.U = +n[0], i + n[0].length) : -1;
    }
    function d3_time_parseWeekNumberMonday(date, string, i) {
      d3_time_numberRe.lastIndex = 0;
      var n = d3_time_numberRe.exec(string.substring(i));
      return n ? (date.W = +n[0], i + n[0].length) : -1;
    }
    function d3_time_parseMonthAbbrev(date, string, i) {
      d3_time_monthAbbrevRe.lastIndex = 0;
      var n = d3_time_monthAbbrevRe.exec(string.substring(i));
      return n ? (date.m = d3_time_monthAbbrevLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function d3_time_parseMonth(date, string, i) {
      d3_time_monthRe.lastIndex = 0;
      var n = d3_time_monthRe.exec(string.substring(i));
      return n ? (date.m = d3_time_monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function d3_time_parseLocaleFull(date, string, i) {
      return d3_time_parse(date, d3_time_formats.c.toString(), string, i);
    }
    function d3_time_parseLocaleDate(date, string, i) {
      return d3_time_parse(date, d3_time_formats.x.toString(), string, i);
    }
    function d3_time_parseLocaleTime(date, string, i) {
      return d3_time_parse(date, d3_time_formats.X.toString(), string, i);
    }
    function d3_time_parseFullYear(date, string, i) {
      d3_time_numberRe.lastIndex = 0;
      var n = d3_time_numberRe.exec(string.substring(i, i + 4));
      return n ? (date.y = +n[0], i + n[0].length) : -1;
    }
    function d3_time_parseYear(date, string, i) {
      d3_time_numberRe.lastIndex = 0;
      var n = d3_time_numberRe.exec(string.substring(i, i + 2));
      return n ? (date.y = d3_time_expandYear(+n[0]), i + n[0].length) : -1;
    }
    function d3_time_parseZone(date, string, i) {
      return /^[+-]\d{4}$/.test(string = string.substring(i, i + 5)) ? (date.Z = +string, i + 5) : -1;
    }
    function d3_time_expandYear(d) {
      return d + (d > 68 ? 1900 : 2000);
    }
    function d3_time_parseMonthNumber(date, string, i) {
      d3_time_numberRe.lastIndex = 0;
      var n = d3_time_numberRe.exec(string.substring(i, i + 2));
      return n ? (date.m = n[0] - 1, i + n[0].length) : -1;
    }
    function d3_time_parseDay(date, string, i) {
      d3_time_numberRe.lastIndex = 0;
      var n = d3_time_numberRe.exec(string.substring(i, i + 2));
      return n ? (date.d = +n[0], i + n[0].length) : -1;
    }
    function d3_time_parseDayOfYear(date, string, i) {
      d3_time_numberRe.lastIndex = 0;
      var n = d3_time_numberRe.exec(string.substring(i, i + 3));
      return n ? (date.j = +n[0], i + n[0].length) : -1;
    }
    function d3_time_parseHour24(date, string, i) {
      d3_time_numberRe.lastIndex = 0;
      var n = d3_time_numberRe.exec(string.substring(i, i + 2));
      return n ? (date.H = +n[0], i + n[0].length) : -1;
    }
    function d3_time_parseMinutes(date, string, i) {
      d3_time_numberRe.lastIndex = 0;
      var n = d3_time_numberRe.exec(string.substring(i, i + 2));
      return n ? (date.M = +n[0], i + n[0].length) : -1;
    }
    function d3_time_parseSeconds(date, string, i) {
      d3_time_numberRe.lastIndex = 0;
      var n = d3_time_numberRe.exec(string.substring(i, i + 2));
      return n ? (date.S = +n[0], i + n[0].length) : -1;
    }
    function d3_time_parseMilliseconds(date, string, i) {
      d3_time_numberRe.lastIndex = 0;
      var n = d3_time_numberRe.exec(string.substring(i, i + 3));
      return n ? (date.L = +n[0], i + n[0].length) : -1;
    }
    var d3_time_numberRe = /^\s*\d+/;
    function d3_time_parseAmPm(date, string, i) {
      var n = d3_time_amPmLookup.get(string.substring(i, i += 2).toLowerCase());
      return n == null ? -1 : (date.p = n, i);
    }
    var d3_time_amPmLookup = d3.map({
        am: 0,
        pm: 1
      });
    function d3_time_zone(d) {
      var z = d.getTimezoneOffset(), zs = z > 0 ? '-' : '+', zh = ~~(Math.abs(z) / 60), zm = Math.abs(z) % 60;
      return zs + d3_time_formatPad(zh, '0', 2) + d3_time_formatPad(zm, '0', 2);
    }
    function d3_time_parseLiteralPercent(date, string, i) {
      d3_time_percentRe.lastIndex = 0;
      var n = d3_time_percentRe.exec(string.substring(i, i + 1));
      return n ? i + n[0].length : -1;
    }
    d3_time_format.utc = d3_time_formatUtc;
    function d3_time_formatUtc(template) {
      var local = d3_time_format(template);
      function format(date) {
        try {
          d3_date = d3_date_utc;
          var utc = new d3_date();
          utc._ = date;
          return local(utc);
        } finally {
          d3_date = Date;
        }
      }
      format.parse = function (string) {
        try {
          d3_date = d3_date_utc;
          var date = local.parse(string);
          return date && date._;
        } finally {
          d3_date = Date;
        }
      };
      format.toString = local.toString;
      return format;
    }
    var d3_time_formatIso = d3_time_formatUtc('%Y-%m-%dT%H:%M:%S.%LZ');
    d3_time_format.iso = Date.prototype.toISOString && +new Date('2000-01-01T00:00:00.000Z') ? d3_time_formatIsoNative : d3_time_formatIso;
    function d3_time_formatIsoNative(date) {
      return date.toISOString();
    }
    d3_time_formatIsoNative.parse = function (string) {
      var date = new Date(string);
      return isNaN(date) ? null : date;
    };
    d3_time_formatIsoNative.toString = d3_time_formatIso.toString;
    d3_time.second = d3_time_interval(function (date) {
      return new d3_date(Math.floor(date / 1000) * 1000);
    }, function (date, offset) {
      date.setTime(date.getTime() + Math.floor(offset) * 1000);
    }, function (date) {
      return date.getSeconds();
    });
    d3_time.seconds = d3_time.second.range;
    d3_time.seconds.utc = d3_time.second.utc.range;
    d3_time.minute = d3_time_interval(function (date) {
      return new d3_date(Math.floor(date / 60000) * 60000);
    }, function (date, offset) {
      date.setTime(date.getTime() + Math.floor(offset) * 60000);
    }, function (date) {
      return date.getMinutes();
    });
    d3_time.minutes = d3_time.minute.range;
    d3_time.minutes.utc = d3_time.minute.utc.range;
    d3_time.hour = d3_time_interval(function (date) {
      var timezone = date.getTimezoneOffset() / 60;
      return new d3_date((Math.floor(date / 3600000 - timezone) + timezone) * 3600000);
    }, function (date, offset) {
      date.setTime(date.getTime() + Math.floor(offset) * 3600000);
    }, function (date) {
      return date.getHours();
    });
    d3_time.hours = d3_time.hour.range;
    d3_time.hours.utc = d3_time.hour.utc.range;
    d3_time.month = d3_time_interval(function (date) {
      date = d3_time.day(date);
      date.setDate(1);
      return date;
    }, function (date, offset) {
      date.setMonth(date.getMonth() + offset);
    }, function (date) {
      return date.getMonth();
    });
    d3_time.months = d3_time.month.range;
    d3_time.months.utc = d3_time.month.utc.range;
    function d3_time_scale(linear, methods, format) {
      function scale(x) {
        return linear(x);
      }
      scale.invert = function (x) {
        return d3_time_scaleDate(linear.invert(x));
      };
      scale.domain = function (x) {
        if (!arguments.length)
          return linear.domain().map(d3_time_scaleDate);
        linear.domain(x);
        return scale;
      };
      function tickMethod(extent, count) {
        var span = extent[1] - extent[0], target = span / count, i = d3.bisect(d3_time_scaleSteps, target);
        return i == d3_time_scaleSteps.length ? [
          methods.year,
          d3_scale_linearTickRange(extent.map(function (d) {
            return d / 31536000000;
          }), count)[2]
        ] : !i ? [
          d3_time_scaleMilliseconds,
          d3_scale_linearTickRange(extent, count)[2]
        ] : methods[target / d3_time_scaleSteps[i - 1] < d3_time_scaleSteps[i] / target ? i - 1 : i];
      }
      scale.nice = function (interval, skip) {
        var domain = scale.domain(), extent = d3_scaleExtent(domain), method = interval == null ? tickMethod(extent, 10) : typeof interval === 'number' && tickMethod(extent, interval);
        if (method)
          interval = method[0], skip = method[1];
        function skipped(date) {
          return !isNaN(date) && !interval.range(date, d3_time_scaleDate(+date + 1), skip).length;
        }
        return scale.domain(d3_scale_nice(domain, skip > 1 ? {
          floor: function (date) {
            while (skipped(date = interval.floor(date)))
              date = d3_time_scaleDate(date - 1);
            return date;
          },
          ceil: function (date) {
            while (skipped(date = interval.ceil(date)))
              date = d3_time_scaleDate(+date + 1);
            return date;
          }
        } : interval));
      };
      scale.ticks = function (interval, skip) {
        var extent = d3_scaleExtent(scale.domain()), method = interval == null ? tickMethod(extent, 10) : typeof interval === 'number' ? tickMethod(extent, interval) : !interval.range && [
            { range: interval },
            skip
          ];
        if (method)
          interval = method[0], skip = method[1];
        return interval.range(extent[0], d3_time_scaleDate(+extent[1] + 1), skip < 1 ? 1 : skip);
      };
      scale.tickFormat = function () {
        return format;
      };
      scale.copy = function () {
        return d3_time_scale(linear.copy(), methods, format);
      };
      return d3_scale_linearRebind(scale, linear);
    }
    function d3_time_scaleDate(t) {
      return new Date(t);
    }
    function d3_time_scaleFormat(formats) {
      return function (date) {
        var i = formats.length - 1, f = formats[i];
        while (!f[1](date))
          f = formats[--i];
        return f[0](date);
      };
    }
    var d3_time_scaleSteps = [
        1000,
        5000,
        15000,
        30000,
        60000,
        300000,
        900000,
        1800000,
        3600000,
        10800000,
        21600000,
        43200000,
        86400000,
        172800000,
        604800000,
        2592000000,
        7776000000,
        31536000000
      ];
    var d3_time_scaleLocalMethods = [
        [
          d3_time.second,
          1
        ],
        [
          d3_time.second,
          5
        ],
        [
          d3_time.second,
          15
        ],
        [
          d3_time.second,
          30
        ],
        [
          d3_time.minute,
          1
        ],
        [
          d3_time.minute,
          5
        ],
        [
          d3_time.minute,
          15
        ],
        [
          d3_time.minute,
          30
        ],
        [
          d3_time.hour,
          1
        ],
        [
          d3_time.hour,
          3
        ],
        [
          d3_time.hour,
          6
        ],
        [
          d3_time.hour,
          12
        ],
        [
          d3_time.day,
          1
        ],
        [
          d3_time.day,
          2
        ],
        [
          d3_time.week,
          1
        ],
        [
          d3_time.month,
          1
        ],
        [
          d3_time.month,
          3
        ],
        [
          d3_time.year,
          1
        ]
      ];
    var d3_time_scaleLocalFormats = [
        [
          d3_time_format('%Y'),
          d3_true
        ],
        [
          d3_time_format('%B'),
          function (d) {
            return d.getMonth();
          }
        ],
        [
          d3_time_format('%b %d'),
          function (d) {
            return d.getDate() != 1;
          }
        ],
        [
          d3_time_format('%a %d'),
          function (d) {
            return d.getDay() && d.getDate() != 1;
          }
        ],
        [
          d3_time_format('%I %p'),
          function (d) {
            return d.getHours();
          }
        ],
        [
          d3_time_format('%I:%M'),
          function (d) {
            return d.getMinutes();
          }
        ],
        [
          d3_time_format(':%S'),
          function (d) {
            return d.getSeconds();
          }
        ],
        [
          d3_time_format('.%L'),
          function (d) {
            return d.getMilliseconds();
          }
        ]
      ];
    var d3_time_scaleLocalFormat = d3_time_scaleFormat(d3_time_scaleLocalFormats);
    d3_time_scaleLocalMethods.year = d3_time.year;
    d3_time.scale = function () {
      return d3_time_scale(d3.scale.linear(), d3_time_scaleLocalMethods, d3_time_scaleLocalFormat);
    };
    var d3_time_scaleMilliseconds = {
        range: function (start, stop, step) {
          return d3.range(+start, +stop, step).map(d3_time_scaleDate);
        }
      };
    var d3_time_scaleUTCMethods = d3_time_scaleLocalMethods.map(function (m) {
        return [
          m[0].utc,
          m[1]
        ];
      });
    var d3_time_scaleUTCFormats = [
        [
          d3_time_formatUtc('%Y'),
          d3_true
        ],
        [
          d3_time_formatUtc('%B'),
          function (d) {
            return d.getUTCMonth();
          }
        ],
        [
          d3_time_formatUtc('%b %d'),
          function (d) {
            return d.getUTCDate() != 1;
          }
        ],
        [
          d3_time_formatUtc('%a %d'),
          function (d) {
            return d.getUTCDay() && d.getUTCDate() != 1;
          }
        ],
        [
          d3_time_formatUtc('%I %p'),
          function (d) {
            return d.getUTCHours();
          }
        ],
        [
          d3_time_formatUtc('%I:%M'),
          function (d) {
            return d.getUTCMinutes();
          }
        ],
        [
          d3_time_formatUtc(':%S'),
          function (d) {
            return d.getUTCSeconds();
          }
        ],
        [
          d3_time_formatUtc('.%L'),
          function (d) {
            return d.getUTCMilliseconds();
          }
        ]
      ];
    var d3_time_scaleUTCFormat = d3_time_scaleFormat(d3_time_scaleUTCFormats);
    d3_time_scaleUTCMethods.year = d3_time.year.utc;
    d3_time.scale.utc = function () {
      return d3_time_scale(d3.scale.linear(), d3_time_scaleUTCMethods, d3_time_scaleUTCFormat);
    };
    d3.text = d3_xhrType(function (request) {
      return request.responseText;
    });
    d3.json = function (url, callback) {
      return d3_xhr(url, 'application/json', d3_json, callback);
    };
    function d3_json(request) {
      return JSON.parse(request.responseText);
    }
    d3.html = function (url, callback) {
      return d3_xhr(url, 'text/html', d3_html, callback);
    };
    function d3_html(request) {
      var range = d3_document.createRange();
      range.selectNode(d3_document.body);
      return range.createContextualFragment(request.responseText);
    }
    d3.xml = d3_xhrType(function (request) {
      return request.responseXML;
    });
    return d3;
  }();
  d3.sankey = function () {
    var sankey = {}, nodeWidth = 24, nodePadding = 8, size = [
        1,
        1
      ], nodes = [], links = [];
    sankey.nodeWidth = function (_) {
      if (!arguments.length)
        return nodeWidth;
      nodeWidth = +_;
      return sankey;
    };
    sankey.nodePadding = function (_) {
      if (!arguments.length)
        return nodePadding;
      nodePadding = +_;
      return sankey;
    };
    sankey.nodes = function (_) {
      if (!arguments.length)
        return nodes;
      nodes = _;
      return sankey;
    };
    sankey.links = function (_) {
      if (!arguments.length)
        return links;
      links = _;
      return sankey;
    };
    sankey.size = function (_) {
      if (!arguments.length)
        return size;
      size = _;
      return sankey;
    };
    sankey.layout = function (iterations) {
      computeNodeLinks();
      computeNodeValues();
      computeNodeBreadths();
      computeNodeDepths(iterations);
      computeLinkDepths();
      return sankey;
    };
    sankey.relayout = function () {
      computeLinkDepths();
      return sankey;
    };
    sankey.link = function () {
      var curvature = 0.5;
      function link(d) {
        var x0 = d.source.x + d.source.dx, x1 = d.target.x, xi = d3.interpolateNumber(x0, x1), x2 = xi(curvature), x3 = xi(1 - curvature), y0 = d.source.y + d.sy + d.dy / 2, y1 = d.target.y + d.ty + d.dy / 2;
        return 'M' + x0 + ',' + y0 + 'C' + x2 + ',' + y0 + ' ' + x3 + ',' + y1 + ' ' + x1 + ',' + y1;
      }
      link.curvature = function (_) {
        if (!arguments.length)
          return curvature;
        curvature = +_;
        return link;
      };
      return link;
    };
    function computeNodeLinks() {
      nodes.forEach(function (node) {
        node.sourceLinks = [];
        node.targetLinks = [];
      });
      links.forEach(function (link) {
        var source = link.source, target = link.target;
        if (typeof source === 'number')
          source = link.source = nodes[link.source];
        if (typeof target === 'number')
          target = link.target = nodes[link.target];
        source.sourceLinks.push(link);
        target.targetLinks.push(link);
      });
    }
    function computeNodeValues() {
      nodes.forEach(function (node) {
        node.value = Math.max(d3.sum(node.sourceLinks, value), d3.sum(node.targetLinks, value));
      });
    }
    function computeNodeBreadths() {
      var remainingNodes = nodes, nextNodes, x = 0;
      while (remainingNodes.length) {
        nextNodes = [];
        remainingNodes.forEach(function (node) {
          node.x = x;
          node.dx = nodeWidth;
          node.sourceLinks.forEach(function (link) {
            nextNodes.push(link.target);
          });
        });
        remainingNodes = nextNodes;
        ++x;
      }
      moveSinksRight(x);
      scaleNodeBreadths((size[0] - nodeWidth) / (x - 1));
    }
    function moveSourcesRight() {
      nodes.forEach(function (node) {
        if (!node.targetLinks.length) {
          node.x = d3.min(node.sourceLinks, function (d) {
            return d.target.x;
          }) - 1;
        }
      });
    }
    function moveSinksRight(x) {
      nodes.forEach(function (node) {
        if (!node.sourceLinks.length) {
          node.x = x - 1;
        }
      });
    }
    function scaleNodeBreadths(kx) {
      nodes.forEach(function (node) {
        node.x *= kx;
      });
    }
    function computeNodeDepths(iterations) {
      var nodesByBreadth = d3.nest().key(function (d) {
          return d.x;
        }).sortKeys(d3.ascending).entries(nodes).map(function (d) {
          return d.values;
        });
      initializeNodeDepth();
      resolveCollisions();
      for (var alpha = 1; iterations > 0; --iterations) {
        relaxRightToLeft(alpha *= 0.99);
        resolveCollisions();
        relaxLeftToRight(alpha);
        resolveCollisions();
      }
      function initializeNodeDepth() {
        var ky = d3.min(nodesByBreadth, function (nodes) {
            return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
          });
        nodesByBreadth.forEach(function (nodes) {
          nodes.forEach(function (node, i) {
            node.y = i;
            node.dy = node.value * ky;
          });
        });
        links.forEach(function (link) {
          link.dy = link.value * ky;
        });
      }
      function relaxLeftToRight(alpha) {
        nodesByBreadth.forEach(function (nodes, breadth) {
          nodes.forEach(function (node) {
            if (node.targetLinks.length) {
              var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
              node.y += (y - center(node)) * alpha;
            }
          });
        });
        function weightedSource(link) {
          return center(link.source) * link.value;
        }
      }
      function relaxRightToLeft(alpha) {
        nodesByBreadth.slice().reverse().forEach(function (nodes) {
          nodes.forEach(function (node) {
            if (node.sourceLinks.length) {
              var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
              node.y += (y - center(node)) * alpha;
            }
          });
        });
        function weightedTarget(link) {
          return center(link.target) * link.value;
        }
      }
      function resolveCollisions() {
        nodesByBreadth.forEach(function (nodes) {
          var node, dy, y0 = 0, n = nodes.length, i;
          nodes.sort(ascendingDepth);
          for (i = 0; i < n; ++i) {
            node = nodes[i];
            dy = y0 - node.y;
            if (dy > 0)
              node.y += dy;
            y0 = node.y + node.dy + nodePadding;
          }
          dy = y0 - nodePadding - size[1];
          if (dy > 0) {
            y0 = node.y -= dy;
            for (i = n - 2; i >= 0; --i) {
              node = nodes[i];
              dy = node.y + node.dy + nodePadding - y0;
              if (dy > 0)
                node.y -= dy;
              y0 = node.y;
            }
          }
        });
      }
      function ascendingDepth(a, b) {
        return a.y - b.y;
      }
    }
    function computeLinkDepths() {
      nodes.forEach(function (node) {
        node.sourceLinks.sort(ascendingTargetDepth);
        node.targetLinks.sort(ascendingSourceDepth);
      });
      nodes.forEach(function (node) {
        var sy = 0, ty = 0;
        node.sourceLinks.forEach(function (link) {
          link.sy = sy;
          sy += link.dy;
        });
        node.targetLinks.forEach(function (link) {
          link.ty = ty;
          ty += link.dy;
        });
      });
      function ascendingSourceDepth(a, b) {
        return a.source.y - b.source.y;
      }
      function ascendingTargetDepth(a, b) {
        return a.target.y - b.target.y;
      }
    }
    function center(node) {
      return node.y + node.dy / 2;
    }
    function value(link) {
      return link.value;
    }
    return sankey;
  };
  return d3;
});
'use strict';
angular.module('iUtltimateApp').service('Rest', [
  '$location',
  function Rest($location) {
    var exports = {};
    var Ultimate = {};
    Ultimate.busyDialogStack = 0;
    Ultimate.baseRestUrl = 'http://www.ultimate-numbers.com/rest/view';
    Ultimate.sessionId = new Date().getTime() + '';
    exports.retrieveTeam = function (id, includePlayers, successFunction, errorFunction) {
      sendAnalyticsEvent('retrieveTeam');
      var url = Ultimate.baseRestUrl + '/team/' + id;
      url = includePlayers ? url + '?players=true' : url;
      sendRequest({
        url: url,
        dataType: 'json',
        success: successFunction,
        error: errorFunction
      });
    };
    function retrieveTeamForAdmin(id, includePlayers, successFunction, errorFunction) {
      sendAnalyticsEvent('retrieveTeamForAdmin');
      var url = Ultimate.baseRestUrl + '/admin/team/' + id;
      url = includePlayers ? url + '?players=true' : url;
      sendRequest({
        url: url,
        dataType: 'json',
        success: successFunction,
        error: errorFunction
      });
    }
    exports.retrieveGames = function (teamId, successFunction, errorFunction) {
      sendAnalyticsEvent('retrieveGames');
      var url = Ultimate.baseRestUrl + '/team/' + teamId + '/games';
      sendRequest({
        url: url,
        dataType: 'json',
        success: successFunction,
        error: errorFunction
      });
    };
    function retrieveGamesData(teamId, successFunction, errorFunction) {
      sendAnalyticsEvent('retrieveGames');
      var url = Ultimate.baseRestUrl + '/team/' + teamId + '/gamesdata';
      sendRequest({
        url: url,
        dataType: 'json',
        success: successFunction,
        error: errorFunction
      });
    }
    function retrieveGamesForAdmin(teamId, successFunction, errorFunction) {
      sendAnalyticsEvent('retrieveGamesForAdmin');
      var url = Ultimate.baseRestUrl + '/admin/team/' + teamId + '/games';
      sendRequest({
        url: url,
        dataType: 'json',
        success: successFunction,
        error: errorFunction
      });
    }
    exports.retrieveGame = function (teamId, gameId, successFunction, errorFunction) {
      sendAnalyticsEvent('retrieveGame');
      var url = Ultimate.baseRestUrl + '/team/' + teamId + '/game/' + gameId;
      sendRequest({
        url: url,
        dataType: 'json',
        success: successFunction,
        error: errorFunction
      });
    };
    function deleteGame(teamId, gameId, successFunction, errorFunction) {
      sendAnalyticsEvent('deleteGame');
      var url = Ultimate.baseRestUrl + '/team/' + teamId + '/game/' + gameId + '/delete';
      sendRequest({
        url: url,
        dataType: 'json',
        isPost: true,
        success: successFunction,
        error: errorFunction
      });
    }
    function deleteTeam(teamId, successFunction, errorFunction) {
      sendAnalyticsEvent('deleteTeam');
      var url = Ultimate.baseRestUrl + '/team/' + teamId + '/delete';
      sendRequest({
        url: url,
        dataType: 'json',
        isPost: true,
        success: successFunction,
        error: errorFunction
      });
    }
    function deletePlayer(teamId, playerToDelete, replacementPlayer, successFunction, errorFunction) {
      sendAnalyticsEvent('deletePlayer');
      var url = Ultimate.baseRestUrl + '/team/' + teamId + '/player/delete?player=' + playerToDelete + '&replacement=' + replacementPlayer;
      sendRequest({
        url: url,
        dataType: 'json',
        isPost: true,
        success: successFunction,
        error: errorFunction
      });
    }
    function renamePlayer(teamId, playerToRename, replacementPlayer, successFunction, errorFunction) {
      sendAnalyticsEvent('renamePlayer');
      var url = Ultimate.baseRestUrl + '/team/' + teamId + '/player/rename?player=' + playerToRename + '&replacement=' + replacementPlayer;
      sendRequest({
        url: url,
        dataType: 'json',
        isPost: true,
        success: successFunction,
        error: errorFunction
      });
    }
    exports.retrievePlayerStatsForGames = function (teamId, gameIds, successFunction, errorFunction) {
      sendAnalyticsEvent('retrievePlayerStatsForGames');
      var url = Ultimate.baseRestUrl + '/team/' + teamId + '/stats/player';
      if (gameIds != null && gameIds.length > 0) {
        url = url + '?gameIds=' + gameIds.join('_');
      }
      sendRequest({
        url: url,
        dataType: 'json',
        success: successFunction,
        error: errorFunction
      });
    };
    exports.retrieveTeamStatsForGames = function (teamId, gameIds, successFunction, errorFunction) {
      sendAnalyticsEvent('retrieveTeamStatsForGames');
      var url = Ultimate.baseRestUrl + '/team/' + teamId + '/stats/team';
      if (gameIds != null && gameIds.length > 0) {
        url = url + '?gameIds=' + gameIds.join('_');
      }
      sendRequest({
        url: url,
        dataType: 'json',
        success: successFunction,
        error: errorFunction
      });
    };
    exports.retrievePlayerStatsForEachGame = function (teamId, gameIds, successFunction, errorFunction) {
      sendAnalyticsEvent('retrievePlayerStatsForGames');
      var url = Ultimate.baseRestUrl + '/team/' + teamId + '/stats/player/games';
      if (gameIds != null && gameIds.length > 0) {
        url = url + '?gameIds=' + gameIds.join('_');
      }
      sendRequest({
        url: url,
        dataType: 'json',
        success: successFunction,
        error: errorFunction
      });
    };
    exports.retrieveAllStatsForGames = function (teamId, gameIds, successFunction, errorFunction) {
      sendAnalyticsEvent('retrieveAllStatsForGames');
      var url = Ultimate.baseRestUrl + '/team/' + teamId + '/stats/all';
      if (gameIds != null && gameIds.length > 0) {
        url = url + '?gameIds=' + gameIds.join('_');
      }
      sendRequest({
        url: url,
        dataType: 'json',
        success: successFunction,
        error: errorFunction
      });
    };
    function retrieveTeams(successFunction, errorFunction) {
      sendAnalyticsEvent('retrieveTeams');
      var url = Ultimate.baseRestUrl + '/teams';
      sendRequest({
        url: url,
        dataType: 'json',
        success: successFunction,
        error: errorFunction
      });
    }
    function retrievePlayerStatsForGame(options, successFunction, errorFunction) {
      sendAnalyticsEvent('retrievePlayerStatsForGame');
      var teamId = options.teamId;
      retrievePlayerStatsForGames(teamId, [options.gameId], successFunction, errorFunction);
    }
    function savePassword(teamId, password, successFunction, errorFunction) {
      sendAnalyticsEvent('savePassword');
      var url = Ultimate.baseRestUrl + '/team/' + teamId + '/password/' + (isNullOrEmpty(password) ? 'REMOVE-PASSWORD' : password);
      sendRequest({
        url: url,
        dataType: 'json',
        isPost: true,
        success: successFunction,
        error: errorFunction
      });
    }
    exports.signon = function (teamId, password, successFunction, errorFunction) {
      sendAnalyticsEvent('signon');
      var url = Ultimate.baseRestUrl + '/team/' + teamId + '/authenticate/' + password;
      sendRequest({
        url: url,
        dataType: 'json',
        isPost: true,
        success: successFunction,
        error: errorFunction
      });
    };
    exports.urlForStatsExportFileDownload = function (teamId, games) {
      var url = Ultimate.baseRestUrl + '/team/' + teamId + '/stats/export';
      if (games) {
        var sortedGames = sortGames(games);
        var gameIds = collectGameIds(sortedGames);
        if (gameIds != null && gameIds.length > 0) {
          url = url + '?gameIds=' + gameIds.join('_');
        }
      }
      return url;
    };
    function urlForGameExportFileDownload(teamId, gameId) {
      var url = Ultimate.baseRestUrl + '/team/' + teamId + '/export/game/' + gameId + '?players=true';
      return url;
    }
    function urlForGameExportFileUpload(teamId) {
      var returnUrl = encodeURIComponent('/team/admin#teamgamespage?team=' + teamId);
      var url = Ultimate.baseRestUrl + '/team/' + teamId + '/import/game?return=' + returnUrl;
      return url;
    }
    function sendRequest(request) {
      var options = {
          success: function (data, textStatus, jqXHR) {
            busyDialogEnd();
            var responseTypeReceived = jqXHR.getResponseHeader('Content-Type');
            if (isExpectedResponseType(request, jqXHR)) {
              request.success(data, textStatus, jqXHR);
            } else {
              logRequestFailure(jqXHR, '', 'unexpected response type = ' + responseTypeReceived);
            }
          },
          error: function (jqXHR, textStatus, errorThrown) {
            busyDialogEnd();
            var error = logRequestFailure(jqXHR, textStatus, errorThrown);
            if (request.error) {
              request.error(jqXHR, textStatus, errorThrown);
            } else {
              throw error;
            }
          }
        };
      if (request.dataType) {
        options.dataType = request.dataType;
      }
      if (request.isPost) {
        options.type = 'POST';
        options.contentType = 'application/json';
      }
      if (request.data) {
        options.data = request.data;
      }
      busyDialogStart();
      Ultimate.sessionId = 'foo';
      var url = addQueryStringParameter(request.url, 'cachebuster', Ultimate.sessionId);
      options.xhrFields = { withCredentials: true };
      $.ajax(url, options);
    }
    function isExpectedResponseType(request, responseTypeReceived) {
      if (request.expectedResponseType) {
        if (responseTypeReceived.indexOf(request.expectedResponseType) < 0) {
          return false;
        }
      }
      return true;
    }
    function addCommas(nStr) {
      nStr += '';
      x = nStr.split('.');
      x1 = x[0];
      x2 = x.length > 1 ? '.' + x[1] : '';
      var rgx = /(\d+)(\d{3})/;
      while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
      }
      return x1 + x2;
    }
    function logRequestFailure(jqXHR, textStatus, errorThrow) {
      var error = errorDescription(jqXHR, textStatus, errorThrow);
      logError(error);
      return error;
    }
    function errorDescription(jqXHR, textStatus, errorThrow) {
      return 'ERROR: status ' + jqXHR.status + ' (' + textStatus + ') ' + errorThrow + (jqXHR.responseText ? ' \n' + jqXHR.responseText : '');
    }
    function getParameterByName(name) {
      var parts = window.location.href.split('?');
      var queryString = '?' + parts[parts.length - 1];
      var match = RegExp('[?&]' + name + '=([^&]*)').exec(queryString);
      var value = match && decodeURIComponent(match[1].replace(/\+/g, ' '));
      return value;
    }
    function logError(error) {
      if (window.console) {
        console.log(error);
      }
    }
    function sortGames(games) {
      var sortedGames = games.sort(function (a, b) {
          var first = a.msSinceEpoch ? a.msSinceEpoch : 0;
          var second = b.msSinceEpoch ? b.msSinceEpoch : 0;
          return second - first;
        });
      return sortedGames;
    }
    function collectGameIds(games) {
      var gameIds = [];
      $.each(games, function () {
        gameIds.push(this.gameId);
      });
      return gameIds;
    }
    function getTournaments(games) {
      var tournamentsList = [];
      if (games && games.length > 0) {
        var sortedGames = sortGames(games);
        var tournamentGames = {};
        jQuery.each(sortedGames, function () {
          var name = this.tournamentName;
          if (name) {
            var year = this.msSinceEpoch ? new Date(this.msSinceEpoch).getFullYear() : '';
            var id = 'TOURNAMENT-' + name + '-' + year;
            if (!tournamentGames[id]) {
              tournamentGames[id] = [];
              tournamentsList.push({
                id: id,
                name: name,
                year: year
              });
            }
            tournamentGames[id].push(this.gameId);
          }
        });
        jQuery.each(tournamentsList, function () {
          this.games = tournamentGames[this.id];
        });
        return tournamentsList;
      }
      return [];
    }
    function getInternetExplorerVersion() {
      var rv = -1;
      if (navigator.appName == 'Microsoft Internet Explorer') {
        var ua = navigator.userAgent;
        var re = new RegExp('MSIE ([0-9]{1,}[.0-9]{0,})');
        if (re.exec(ua) != null)
          rv = parseFloat(RegExp.$1);
      }
      return rv;
    }
    function log(message) {
      if (window.console) {
        console.log(message);
      }
    }
    function isNullOrEmpty(s) {
      return s == null || jQuery.trim(s) == '';
    }
    function busyDialogStart() {
      Ultimate.busyDialogStack++;
      if (Ultimate.busyDialogStack == 1) {
        $('.hideWhenBusy').addClass('hidden');
        $('.spinner').removeClass('hidden');
      }
    }
    function busyDialogEnd() {
      Ultimate.busyDialogStack--;
      if (Ultimate.busyDialogStack == 0) {
        resetBusyDialog();
      }
    }
    function resetBusyDialog() {
      $('.spinner').addClass('hidden');
      showHiddenWhenBusyElements();
      Ultimate.busyDialogStack == 0;
    }
    Ultimate.Canonicalizer = function () {
      this.toCanonicalString = function (object, options) {
        var allProps = [];
        var visitedObjects = [];
        pushObject(object, allProps, options, 0, visitedObjects);
        return allProps.join('');
      };
      function pushObject(obj, allProps, options, level, visitedObjects) {
        if (typeof obj == 'object' && obj != null) {
          var visitedReference = getVisitedReference(obj, visitedObjects);
          if (visitedReference) {
            allProps[allProps.length] = visitedReference;
          } else {
            visitedObjects.push(obj);
            var props = [];
            for (var prop in obj) {
              props.push(prop);
            }
            props = props.sort();
            for (var i = 0; i < props.length; i++) {
              var childObj = obj[props[i]];
              if (shouldPush(childObj, options, props[i])) {
                allProps[allProps.length] = '\n';
                for (var j = 0; j < level; j++) {
                  allProps[allProps.length] = '.';
                }
                allProps[allProps.length] = props[i];
                allProps[allProps.length] = ':';
                pushObject(childObj, allProps, options, level + 1, visitedObjects);
              }
            }
          }
        } else {
          allProps[allProps.length] = obj == null ? 'null' : obj;
        }
      }
      function shouldPush(value, options, propName) {
        if (propName && options[propName]) {
          return false;
        } else if (typeof value == 'function' || value === undefined) {
          return false;
        } else if (options.treatNullAsUndefined && value === null) {
          return false;
        } else if (options.treatEmptyStringsAsUndefined && value == '') {
          return false;
        }
        return true;
      }
      function getVisitedReference(object, visitedObjects) {
        for (var i = 0; i < visitedObjects.length; i++) {
          if (visitedObjects[i] === object) {
            return '@REF' + i;
          }
        }
        return null;
      }
    };
    function showHiddenWhenBusyElements() {
      $('.hideWhenBusy').removeClass('hidden');
    }
    function hideHiddenWhenBusyElements() {
      $('.hideWhenBusy').addClass('hidden');
    }
    function addQueryStringParameter(url, key, value) {
      return url + (url.indexOf('?') > 0 ? '&' : '?') + key + '=' + value;
    }
    function resetCacheBuster() {
      Ultimate.sessionId = new Date().getTime() + '';
    }
    function sendAnalyticsEvent(restEndpointName) {
    }
    return exports;
  }
]);
'use strict';
angular.module('iUtltimateApp').service('Stathelpers', function Stathelpers() {
  var exports = {};
  exports.findGreatest = function (games, field) {
    var winner = games[0];
    _.each(games, function (value) {
      if (winner[field] < value[field] && value.playerName !== 'Anonymous') {
        winner = value;
      }
    });
    return winner;
  };
  return exports;
});
'use strict';
angular.module('iUtltimateApp').directive('statTable', [
  '$route',
  function ($route) {
    return {
      templateUrl: 'views/partials/statTable.html',
      restrict: 'AE',
      priority: 0,
      scope: {
        team: '=',
        stats: '=',
        callback: '='
      },
      link: function postLink(scope, element, attrs) {
        var last;
        var order = 1;
        var perPoints = [
            'goals',
            'assists',
            'ds',
            'throwaways',
            'drops'
          ];
        var lastRoute = $route.current;
        scope.$on('$locationChangeSuccess', function (event) {
          $route.current = lastRoute;
        });
        scope.$watch('team', function () {
          if (scope.team) {
            _.each(scope.team, function (player) {
              _.each(perPoints, function (type) {
                if (player.pointsPlayed) {
                  player[type + 'PP'] = player[type] / player.pointsPlayed;
                } else {
                  player[type + 'PP'] = 0;
                }
              });
            });
          }
        });
        scope.total = function (type) {
          if (type === 'playerName')
            return 'Total';
          var sum = _.reduce(scope.team, function (memo, value) {
              if (!isNaN(value[type])) {
                return memo + value[type];
              } else {
                return memo;
              }
            }, 0);
          if (scope.team && scope.team.length && (type === 'pullsAvgHangtimeMillis' || type === 'passSuccess' || type === 'catchSuccess' || type.indexOf('PP') > 0)) {
            return sum / scope.team.length;
          } else if (type === 'gamesPlayed') {
            return _.max(scope.team, function (value) {
              return value.gamesPlayed;
            }).gamesPlayed;
          } else {
            return sum;
          }
        };
        scope.average = function (type) {
          if (type === 'playerName')
            return 'Average';
          var sum = _.reduce(scope.team, function (memo, value) {
              if (!isNaN(value[type])) {
                return memo + value[type];
              } else {
                return memo;
              }
            }, 0);
          if (scope.team && scope.team.length) {
            return sum / scope.team.length;
          }
        };
        scope.sortBy = function (type) {
          if (last === type) {
            order *= -1;
          } else {
            last = type;
            order = 1;
          }
          scope.team.sort(function (a, b) {
            if (a[type] < b[type]) {
              return order;
            } else if (a[type] > b[type]) {
              return order * -1;
            } else {
              return 0;
            }
          });
        };
        scope.numFormat = function (num) {
          if (!isNaN(num)) {
            var numStr = num.toLocaleString();
            if (numStr.indexOf('.') >= 0) {
              numStr = numStr.slice(0, numStr.indexOf('.') + 3);
            }
            return numStr;
          } else {
            return num;
          }
        };
        scope.containsWord = function (input, target) {
          return input.indexOf(target) > -1;
        };
        scope.prettify = function (title) {
          switch (title) {
          case 'playerName':
            return 'Player Name';
            break;
          case 'passSuccess':
            return 'Percent Completed';
            break;
          case 'catchSuccess':
            return 'Percent Caught';
            break;
          case 'gamesPlayed':
            return 'Games Played';
            break;
          case 'secondsPlayed':
            return 'Minutes Played';
            break;
          case 'opointsPlayed':
            return 'Offensive Points';
            break;
          case 'dpointsPlayed':
            return 'Defensive Points';
            break;
          case 'relativeOPlusMinus':
            return 'Offensive Relative +/-';
            break;
          case 'relativeDPlusMinus':
            return 'Defensive Relative +/-';
            break;
          case 'ds':
            return 'D\'s';
            break;
          case 'pullsAvgHangtimeMillis':
            return 'Average Hang Time';
            break;
          case 'pullsOB':
            return 'Out of Bounds Pulls';
            break;
          default:
            return title.charAt(0).toUpperCase() + title.replace('PP', '').slice(1);
          }
        };
      }
    };
  }
]);
'use strict';
angular.module('iUtltimateApp').directive('pieChart', [
  'd3',
  function (d3) {
    return {
      restrict: 'A',
      scope: {
        chartHeader: '=',
        data: '=',
        radius: '='
      },
      link: function postLink(scope, element, attrs) {
        scope.$watch('data', function (newVal) {
          if (newVal && newVal.length) {
            d3.select('#' + attrs.id).select('svg').remove();
            var w = scope.radius * 2 + 10, h = scope.radius * 2 + 10, r = scope.radius, color = d3.scale.category20c();
            var data = scope.data;
            var vis = d3.select('#' + attrs.id).append('svg:svg').data([data]).attr('width', w).attr('height', h).append('svg:g').attr('transform', 'translate(' + r + ',' + r + ')');
            var arc = d3.svg.arc().outerRadius(r);
            var tooltip = d3.select(attrs.id).append('div').attr('class', 'target-mouseover-tooltip').text('a simple tooltip');
            var pie = d3.layout.pie().value(function (d) {
                return d.value;
              });
            var arcs = vis.selectAll('g.slice').data(pie).enter().append('svg:g').attr('class', 'slice');
            arcs.append('svg:path').attr('fill', function (d, i) {
              return color(i);
            }).attr('d', arc);
            arcs.append('svg:title').text(function (d) {
              return d.value;
            });
            arcs.append('svg:text').attr('transform', function (d) {
              d.innerRadius = 0;
              d.outerRadius = r;
              return 'translate(' + arc.centroid(d) + ')';
            }).attr('text-anchor', 'middle').text(function (d, i) {
              return data[i].label;
            });
          }
        });
      }
    };
  }
]);
'use strict';
angular.module('iUtltimateApp').directive('barGraph', [
  'd3',
  function (d3) {
    return {
      restrict: 'A',
      scope: {
        chartHeader: '=',
        data: '=',
        radius: '='
      },
      link: function postLink(scope, element, attrs) {
        scope.$watch('data', function (newVal) {
          console.log('foo');
          if (newVal) {
            d3.select('#' + attrs.id).select('svg').remove();
            var w = scope.radius * 2 + 10, h = scope.radius * 2 + 10, r = scope.radius, color = d3.scale.category20c();
            var data = scope.data;
            var vis = d3.select('#' + attrs.id).append('svg:svg').data([data]).attr('width', w).attr('height', h).append('svg:g').attr('transform', 'translate(' + r + ',' + r + ')');
            var arc = d3.svg.arc().outerRadius(r);
            var pie = d3.layout.pie().value(function (d) {
                return d.value;
              });
            var arcs = vis.selectAll('g.slice').data(pie).enter().append('svg:g').attr('class', 'slice');
            arcs.append('svg:path').attr('fill', function (d, i) {
              return color(i);
            }).attr('d', arc);
            arcs.append('svg:text').attr('transform', function (d) {
              d.innerRadius = 0;
              d.outerRadius = r;
              return 'translate(' + arc.centroid(d) + ')';
            }).attr('text-anchor', 'middle').text(function (d, i) {
              return data[i].label;
            });
          }
        });
      }
    };
  }
]);
angular.module('iUtltimateApp').directive('flowChart', [
  'd3',
  function (d3) {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        scope.$watch('flowMap', function (newVal) {
          if (newVal) {
            d3.select('#chart').select('svg').remove();
            var margin = {
                top: 1,
                right: 1,
                bottom: 6,
                left: 1
              }, width = scope.windowWidth * 0.85, height = scope.windowWidth * 0.88;
            var formatNumber = d3.format(',.0f'), format = function (d) {
                return formatNumber(d) + ' Times';
              }, color = d3.scale.category20();
            var svg = d3.select('#chart').append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
            var sankey = d3.sankey().nodeWidth(15).nodePadding(10).size([
                width,
                height
              ]);
            var path = sankey.link();
            sankey.nodes(scope.flowMap.nodes).links(scope.flowMap.links).layout(32);
            var link = svg.append('g').selectAll('.link').data(scope.flowMap.links).enter().append('path').attr('class', 'link').attr('d', path).style('stroke-width', function (d) {
                return Math.max(1, d.dy);
              }).sort(function (a, b) {
                return b.dy - a.dy;
              });
            link.append('title').text(function (d) {
              return d.source.name.slice(0, d.source.name.length - 1) + ' \u2192 ' + d.target.name.slice(0, d.target.name.length - 1) + '\n' + format(d.value);
            });
            var node = svg.append('g').selectAll('.node').data(scope.flowMap.nodes).enter().append('g').attr('class', 'node').attr('transform', function (d) {
                return 'translate(' + d.x + ',' + d.y + ')';
              }).call(d3.behavior.drag().origin(function (d) {
                return d;
              }).on('dragstart', function () {
                this.parentNode.appendChild(this);
              }).on('drag', dragmove));
            node.append('rect').attr('height', function (d) {
              return d.dy;
            }).attr('width', sankey.nodeWidth()).style('fill', function (d) {
              return d.color = color(d.name.replace(/ .*/, ''));
            }).style('stroke', function (d) {
              return d3.rgb(d.color).darker(2);
            }).append('title').text(function (d) {
              return d.name + '\n' + format(d.value);
            });
            node.append('text').attr('x', -6).attr('y', function (d) {
              return d.dy / 2;
            }).attr('dy', '.35em').attr('text-anchor', 'end').attr('transform', null).text(function (d) {
              return d.name.substring(0, d.name.length - 1);
            }).filter(function (d) {
              return d.x < width / 2;
            }).attr('x', 6 + sankey.nodeWidth()).attr('text-anchor', 'start');
            function dragmove(d) {
              d3.select(this).attr('transform', 'translate(' + d.x + ',' + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ')');
              sankey.relayout();
              link.attr('d', path);
            }
          }
        });
      }
    };
  }
]);
'use strict';
angular.module('iUtltimateApp').directive('draggableThing', function () {
  return {
    restrict: 'A',
    link: function (scope, el, attrs, controller) {
      angular.element(el).attr('draggable', 'true');
      var id = angular.element(el).attr('id');
      el.bind('dragstart', function (e) {
        scope.setDragging(scope.player);
      });
      el.bind('dragend', function (e) {
      });
    }
  };
});
'use strict';
angular.module('iUtltimateApp').directive('droppableArea', function () {
  return {
    restrict: 'A',
    link: function (scope, el, attrs, controller) {
      var id = angular.element(el).attr('id');
      el.bind('dragover', function (e) {
        if (e.preventDefault) {
          e.preventDefault();
        }
        if (e.stopPropagation) {
          e.stopPropagation();
        }
        return false;
      });
      el.bind('dragenter', function (e) {
      });
      el.bind('dragleave', function (e) {
      });
      el.bind('drop', function (e) {
        scope.dropped(scope.line);
      });
    }
  };
});
'use strict';
angular.module('iUtltimateApp').directive('unbindable', function () {
  return {
    scope: true,
    controller: [
      '$scope',
      '$element',
      function ($scope, $element) {
        $scope.$on('unbind', function () {
          window.setTimeout(function () {
            $scope.$destroy();
          }, 0);
        });
        $scope.$broadcast('unbind');
      }
    ]
  };
});
'use strict';
angular.module('iUtltimateApp').directive('targetMap', [
  'd3',
  function (d3) {
    return {
      restrict: 'E',
      scope: {
        bubbles: '=',
        players: '=',
        height: '='
      },
      link: function postLink(scope, element, attrs) {
        scope.$watch('bubbles', function () {
          if (scope.bubbles) {
            d3.select(attrs.id).select('svg').remove();
            var diameter = element[0].parentElement.clientWidth - 30, format = d3.format(',d'), color = d3.scale.category20c();
            var tooltip = d3.select(attrs.id).append('div').attr('class', 'target-mouseover-tooltip').text('a simple tooltip');
            var bubble = d3.layout.pack().sort(null).size([
                diameter,
                scope.height + 100
              ]).padding(1.5);
            var svg = d3.select(attrs.id).append('svg').attr('width', diameter).attr('height', scope.height + 100).attr('class', 'bubble');
            var node = svg.selectAll('.node').data(bubble.nodes(scope.bubbles).filter(function (d) {
                return !d.children;
              })).enter().append('g').attr('class', 'target-node').attr('transform', function (d) {
                return 'translate(' + d.x + ',' + d.y + ')';
              }).on('mouseover', function (d) {
                return tooltip.style('visibility', 'visible').text(getText(d));
              }).on('mousemove', function () {
                return tooltip.style('top', d3.event.y - 10 + 'px').style('left', d3.event.x + 10 + 'px');
              }).on('mouseout', function () {
                return tooltip.style('visibility', 'hidden');
              });
            node.append('circle').attr('r', function (d) {
              return d.r;
            }).style('fill', function (d) {
              return getColor(d.actionType, isHandler(d.receiver));
            });
            node.append('text').attr('dy', '.5em').style('text-anchor', 'middle').text(function (d) {
              return d.receiver.substring(0, d.r / 3);
            });
            d3.select(self.frameElement).style('height', diameter + 'px');
          }
        });
        function isHandler(name) {
          return _.reduce(scope.players, function (memo, player) {
            if (player.name === name && player.position === 'Handler') {
              return true;
            } else {
              return memo;
            }
          }, false);
        }
        function getColor(action, isHandler) {
          switch (action) {
          case 'Drop':
            if (isHandler)
              return '#c75aba';
            return '#c5007c';
            break;
          case 'Catch':
            if (isHandler)
              return '#C3CE00';
            return '#949A27';
            break;
          case 'Throwaway':
            return '#ff9400';
            break;
          case 'Goal':
            if (isHandler)
              return '#0faa00';
            return '#298020';
            break;
          default:
            return '#c75aba';
            break;
          }
        }
        function getText(data) {
          switch (data.actionType) {
          case 'Throwaway':
            if (data.value - 1) {
              return data.value + ' throwaways';
            } else {
              return data.value + ' throwaway';
            }
            break;
          case 'Catch':
            if (data.value - 1) {
              return data.value + ' passes to ' + data.receiver;
            } else {
              return data.value + ' pass to ' + data.receiver;
            }
            break;
          case 'Goal':
            if (data.value - 1) {
              return data.value + ' Goals to ' + data.receiver;
            } else {
              return data.value + ' Goal to ' + data.receiver;
            }
            break;
          case 'Drop':
            if (data.value - 1) {
              return data.value + ' dropped passes to ' + data.receiver;
            } else {
              return data.value + ' dropped pass to ' + data.receiver;
            }
            break;
          default:
            return data.actionType + ', ' + data.receiver;
            break;
          }
        }
      }
    };
  }
]);
'use strict';
angular.module('iUtltimateApp').controller('MainpageCtrl', [
  '$scope',
  'Rest',
  '$location',
  '$routeParams',
  function ($scope, Rest, $location, $routeParams) {
    $scope.teamId = $routeParams.teamId;
    var playerName = unHash($routeParams.playerName);
    $scope.selectedPlayerName = playerName && playerName !== 'home' ? playerName : undefined;
    $scope.teamName = '';
    $scope.basicStatsLoaded = false;
    $scope.allStatsLoaded = false;
    $scope.minWindowHeight = window.innerHeight - 200 + 23;
    $scope.focused = 'players';
    $scope.navState = 'collapse';
    $scope.signedIn = 'yellow';
    $scope.windowWidth = window.innerWidth;
    $scope.windowHeight = window.innerHeight;
    $scope.notMobile = window.innerWidth > 500;
    $scope.pageFocus = function (value) {
      return value === $scope.focused;
    };
    $scope.selectPlayer = function (player) {
      $scope.selectedPlayer = player;
      $scope.selectedPlayerName = player.playerName;
      $location.url('/' + $scope.teamId + '/' + hash(player.playerName));
      $scope.changePageFocus('specificPlayer');
    };
    $scope.changePageFocus = function (value) {
      if (value !== 'specificPlayer') {
        $location.url('/' + $scope.teamId + '/home');
        $scope.selectedPlayer = undefined;
        $scope.selectedPlayerName = '';
      }
      $scope.focused = value;
    };
    $scope.selectedPlayerName && $scope.changePageFocus('specificPlayer');
    $scope.toggleNav = function () {
      $scope.navState = $scope.navState ? '' : 'collapse';
    };
    $scope.toggleNavType = function () {
      $scope.navState = $scope.navState ? '' : 'in';
    };
    Rest.retrieveTeam($scope.teamId, false, function (response) {
      $scope.teamName = response.name;
      window.document.title = $scope.teamName + ' Ultimate Team';
      $scope.$apply($scope.signedIn = 'green');
    }, function () {
      $scope.$apply($scope.signedIn = 'red');
    });
    $scope.signIn = function () {
      $scope.$apply($scope.signedIn = 'green');
    };
    function hash(str) {
      var result = '';
      for (var i = 0; i < str.length; i++) {
        var k = str[i].charCodeAt() + '';
        while (k.length < 3) {
          k = '0' + k;
        }
        result += k;
      }
      return result;
    }
    ;
    function unHash(str) {
      if (str) {
        var result = '';
        for (var i = 0; i < str.length; i += 3) {
          if (str.match(/[\d]+/)) {
            result += window.String.fromCharCode(str.substring(i, i + 3));
          } else {
            result = undefined;
          }
        }
        return result;
      }
    }
    ;
  }
]);
'use strict';
angular.module('iUtltimateApp').controller('SignonCtrl', [
  '$scope',
  'Rest',
  '$location',
  function ($scope, Rest, $location) {
    $scope.teamName = 'iUltimate';
    $scope.password = { input: '' };
    $scope.badInput = false;
    $scope.signin = function () {
      Rest.signon($scope.teamId, $scope.password.input, function () {
      }, function (response) {
        if (response.status === 200) {
          $scope.signIn();
        } else if (response.status === 401) {
          $scope.$apply($scope.badInput = true);
        } else {
          throw error;
        }
      });
    };
  }
]);
'use strict';
angular.module('iUtltimateApp').controller('LeadersCtrl', [
  '$scope',
  'Stathelpers',
  function ($scope, Stathelpers) {
    $scope.pTLeader = {};
    $scope.oLeader = {};
    $scope.dLeader = {};
    $scope.pMLeader = {};
    $scope.$watch('playerStats', function () {
      if ($scope.playerStats !== undefined) {
        $scope.pTLeader = Stathelpers.findGreatest($scope.playerStats, 'pointsPlayed');
        $scope.oLeader = Stathelpers.findGreatest($scope.playerStats, 'goals');
        $scope.dLeader = Stathelpers.findGreatest($scope.playerStats, 'ds');
        $scope.pMLeader = Stathelpers.findGreatest($scope.playerStats, 'plusMinusCount');
        $scope.pTLeader.minutesPlayed = Math.round($scope.pTLeader.secondsPlayed / 60);
      }
    });
  }
]);
'use strict';
angular.module('iUtltimateApp').controller('PlayerpageCtrl', [
  '$scope',
  'Rest',
  function ($scope, Rest) {
    $scope.loading = true;
    $scope.filterSize = 'filter-thick';
    $scope.$watch('playerStats', function () {
      $scope.consideredStats = $scope.playerStats;
    });
  }
]);
'use strict';
angular.module('iUtltimateApp').controller('StattablesCtrl', [
  '$scope',
  function ($scope) {
    $scope.statFocus = 'passing';
    $scope.focus = function (value) {
      $scope.statFocus = value;
    };
    $scope.passingStats = [
      'playerName',
      'assists',
      'passes',
      'throwaways',
      'stalls',
      'passSuccess'
    ];
    $scope.receivingStats = [
      'playerName',
      'goals',
      'catches',
      'touches',
      'drops',
      'catchSuccess'
    ];
    $scope.pTStats = [
      'playerName',
      'gamesPlayed',
      'pointsPlayed',
      'secondsPlayed',
      'opointsPlayed',
      'dpointsPlayed'
    ];
    $scope.defenseStats = [
      'playerName',
      'ds',
      'callahans',
      'pulls',
      'pullsAvgHangtimeMillis',
      'pullsOB'
    ];
    $scope.perPointStats = [
      'playerName',
      'goalsPP',
      'assistsPP',
      'dsPP',
      'throwawaysPP',
      'dropsPP'
    ];
  }
]);
'use strict';
angular.module('iUtltimateApp').controller('FilterCtrl', [
  '$scope',
  'Rest',
  '$modal',
  '$timeout',
  function ($scope, Rest, $modal, $timeout) {
    $scope.popover = false;
    $scope.message = { 'All Games': [] };
    $scope.modalController = {};
    $scope.filterButtonLabel = 'All Games';
    _.each($scope.allGames, function (game, index) {
      $scope.$watch('allGames[' + index + '].isConsidered', function () {
        if ($scope.allGames && $scope.allGames.length) {
          var consideredCount = 0;
          var lastTournamentCount = 0;
          var lastTournament = $scope.allGames[0].tournamentName;
          _.each($scope.allGames, function (game) {
            if (game.tournamentName === lastTournament) {
              lastTournamentCount++;
            }
            if (game.isConsidered) {
              consideredCount++;
              if (game.tournamentName !== lastTournament) {
                lastTournament = false;
              }
            }
          });
          if (consideredCount === 1 && lastTournament) {
            $scope.filterButtonLabel = 'Last Game';
          } else if (consideredCount === lastTournamentCount && lastTournament) {
            $scope.filterButtonLabel = 'Last Tournament';
          } else if (consideredCount === $scope.allGames.length) {
            $scope.filterButtonLabel = 'All Games';
          } else if (consideredCount === 0) {
            $scope.filterButtonLabel = 'None';
          } else {
            $scope.filterButtonLabel = 'Custom';
          }
        }
      });
    });
    $scope.modalController.open = function () {
      $scope.popover = false;
      $scope.modal = $modal.open({
        templateUrl: 'views/filter/filter-modal.html',
        controller: 'FilterCtrl',
        scope: $scope,
        backdrop: true
      });
    };
    $scope.modalController.close = function () {
      $scope.filterStats();
      $scope.modal.close();
    };
    $scope.considerAll = function () {
      _.each($scope.allGames, function (value) {
        value.isConsidered = true;
      });
      $scope.filterStats();
    };
    $scope.considerOnly = function (consideredGames) {
      if (consideredGames.length) {
        _.each($scope.allGames, function (game) {
          if (game.tournamentName === consideredGames) {
            game.isConsidered = true;
          } else {
            game.isConsidered = false;
          }
        });
      } else {
        _.each($scope.allGames, function (game) {
          game.isConsidered = game.gameId === consideredGames.gameId;
        });
      }
      $scope.filterStats();
    };
    var getConsideredGames = function () {
      var results = [];
      _.each($scope.allGames, function (value) {
        if (value.isConsidered) {
          results.push(value);
        }
      });
      return results;
    };
  }
]);
'use strict';
angular.module('iUtltimateApp').directive('tournament', function () {
  return {
    templateUrl: 'views/partials/tournament.html',
    restrict: 'E',
    scope: { tournament: '=' },
    link: function postLink(scope, element, attrs) {
      scope.checkAll = function (bool) {
        _.each(scope.tournament, function (value) {
          value.isConsidered = bool;
        });
      };
      scope.toggle = function (game) {
        game.isConsidered = !game.isConsidered;
      };
    }
  };
});
'use strict';
angular.module('iUtltimateApp').controller('TeampageCtrl', [
  '$scope',
  function ($scope) {
    $scope.ourBreakPercentageId = 'our-points-by-breaks-graph';
    $scope.theirBreakPercentageId = 'their-points-by-breaks-graph';
    $scope.$watch('teamStats', function () {
      if ($scope.teamStats && Object.keys($scope.teamStats).length > 2) {
        $scope.ourBreakPercentageData = [
          {
            label: 'D-Line Points',
            value: $scope.teamStats.goalSummary.ourDlineGoals
          },
          {
            label: 'O-Line Points',
            value: $scope.teamStats.goalSummary.ourOlineGoals
          }
        ];
        $scope.theirBreakPercentageData = [
          {
            label: 'D-Line Points',
            value: $scope.teamStats.goalSummary.theirDlineGoals
          },
          {
            label: 'O-Line Points',
            value: $scope.teamStats.goalSummary.theirOlineGoals
          }
        ];
      }
    }, true);
    $scope.$watch('allGames', function () {
      if ($scope.allGames) {
        if ($scope.allGames.length) {
          var passesPerPossession = generalizeThrowsPerPossesion($scope.allGames);
          var passesPerScoredPossession = passesPerPossession.failed;
          var passesPerFailedPossession = passesPerPossession.successful;
          $scope.passesPerScoredPossessionData = [
            {
              label: '1',
              value: sumBetweenIndicies(passesPerScoredPossession, 1, 1)
            },
            {
              label: '2 - 4',
              value: sumBetweenIndicies(passesPerScoredPossession, 2, 4)
            },
            {
              label: '5 - 10',
              value: sumBetweenIndicies(passesPerScoredPossession, 5, 10)
            },
            {
              label: '11+',
              value: sumBetweenIndicies(passesPerScoredPossession, 11)
            }
          ];
          $scope.passesPerFailedPossessionData = [
            {
              label: '1',
              value: sumBetweenIndicies(passesPerFailedPossession, 1, 1)
            },
            {
              label: '2 - 4',
              value: sumBetweenIndicies(passesPerFailedPossession, 2, 4)
            },
            {
              label: '5 - 10',
              value: sumBetweenIndicies(passesPerFailedPossession, 5, 10)
            },
            {
              label: '11+',
              value: sumBetweenIndicies(passesPerFailedPossession, 11)
            }
          ];
        }
      }
    }, true);
    var sumBetweenIndicies = function (collection, min, max) {
      max = max || collection.length;
      var sum = 0;
      for (var i = min; i <= max && i < collection.length; i++) {
        if (collection[i]) {
          sum += collection[i];
        }
      }
      return sum;
    };
    var generalizeThrowsPerPossesion = function (games) {
      var failed = [];
      var successful = [];
      _.each(games, function (game) {
        _.each(game.points, function (point) {
          var scored = _.reduce(point.events, function (memo, event) {
              if (event.type === 'Offense') {
                return memo + 1;
              } else {
                failed[memo] ? failed[memo]++ : failed[memo] = 1;
                return 0;
              }
            }, 0);
          successful[scored] ? successful[scored]++ : successful[scored] = 1;
        });
      });
      return {
        failed: failed,
        successful: successful
      };
    };
  }
]);
'use strict';
angular.module('iUtltimateApp').controller('TeamCtrl', [
  '$scope',
  'Rest',
  function ($scope, Rest) {
    $scope.tournaments = {};
    Rest.retrieveTeam($scope.teamId, true, function (data) {
      $scope.players = data.players;
    });
    Rest.retrieveGames($scope.teamId, function (data) {
      $scope.allGames = data;
      _.each($scope.allGames, function (game) {
        game.isConsidered = true;
      });
      $scope.getPlayerStats($scope.getGameSpecificStats);
    });
    var responseCount = 0;
    var loadCount = 0;
    var checkLoad = function (callback) {
      loadCount++;
      if (loadCount === $scope.allGames.length) {
        $scope.derivePlayerStats();
        $scope.$apply($scope.basicStatsLoaded = true);
        callback();
      }
    };
    var onResponse = function (count) {
      if (count === $scope.allGames.length * 2) {
        $scope.filterStats();
        $scope.$apply($scope.allStatsLoaded = true);
      }
    };
    $scope.getGameSpecificStats = function () {
      _.each($scope.allGames, function (value) {
        Rest.retrieveTeamStatsForGames($scope.teamId, [value.gameId], function (data) {
          value.teamStats = data;
          onResponse(++responseCount);
        });
        Rest.retrieveGame($scope.teamId, value.gameId, function (data) {
          value.points = JSON.parse(data.pointsJson);
          onResponse(++responseCount);
        });
      });
    };
    $scope.getPlayerStats = function (callback) {
      var batches = [];
      for (var i = 0; i < $scope.allGames.length;) {
        var batch = [];
        var j = i + 4;
        while (i < j && i < $scope.allGames.length) {
          batch.push($scope.allGames[i]);
          i++;
        }
        batches.push(batch);
      }
      _.each(batches, function (games) {
        var ids = _.reduce(games, function (memo, value) {
            memo.push(value.gameId);
            return memo;
          }, []);
        Rest.retrievePlayerStatsForEachGame($scope.teamId, ids, function (response) {
          _.each(response, function (data) {
            _.each(games, function (game) {
              if (game.gameId === data.gameId) {
                game.playerStats = JSON.parse(data.playerStatsJson);
                checkLoad(callback);
              }
            });
          });
        }, function (error) {
          throw new Error(error.toString());
        });
      });
    };
    $scope.mapTournaments = function (games) {
      var map = {};
      _.each(games, function (value) {
        map[value.tournamentName] ? map[value.tournamentName].push(value) : map[value.tournamentName] = [value];
      });
      return map;
    };
    $scope.derivePlayerStats = function () {
      var team = {};
      var playerStats = [];
      _.each($scope.allGames, function (game) {
        if (game.isConsidered) {
          _.each(game.playerStats, function (player) {
            _.each(player, function (statVal, statType) {
              team[player.playerName] = team[player.playerName] || {};
              if (statType === 'playerName') {
                team[player.playerName][statType] = statVal;
              } else if (statType === 'pullsAvgHangtimeMillis') {
                team[player.playerName].pullTime = team[player.playerName].pullTime || 0;
                team[player.playerName].pullTime += statVal * player.pulls;
              } else {
                team[player.playerName][statType] = team[player.playerName][statType] || 0;
                team[player.playerName][statType] += statVal;
              }
            });
          });
        }
      });
      _.each(team, function (player) {
        player.catchSuccess = player.catches / (player.catches + player.drops) || 0;
        player.passSuccess = player.passes / (player.passes + player.throwaways) || 0;
        player.pullsAvgHangtimeMillis = player.pullTime / player.pulls || 0;
        playerStats.push(player);
      });
      $scope.playerStats = playerStats;
    };
    $scope.filterStats = function () {
      $scope.tournaments = $scope.mapTournaments($scope.allGames);
      var teamStats = {};
      var team = {};
      var consideredCount = 0;
      $scope.getPlayerStats();
      teamStats.teamRecord = _.reduce($scope.allGames, function (memo, value) {
        if (value.isConsidered) {
          consideredCount++;
          if (value.ours > value.theirs) {
            memo.wins++;
          } else {
            memo.losses++;
          }
        }
        return memo;
      }, {
        wins: 0,
        losses: 0
      });
      teamStats.goalSummary = {};
      _.each($scope.allGames, function (game) {
        if (game.isConsidered) {
          teamStats.goalSummary.ourDlineGoals = teamStats.goalSummary.ourDlineGoals || 0;
          teamStats.goalSummary.ourOlineGoals = teamStats.goalSummary.ourOlineGoals || 0;
          teamStats.goalSummary.theirDlineGoals = teamStats.goalSummary.theirDlineGoals || 0;
          teamStats.goalSummary.theirOlineGoals = teamStats.goalSummary.theirOlineGoals || 0;
          teamStats.goalSummary.ourDlineGoals += game.teamStats.goalSummary.ourDlineGoals;
          teamStats.goalSummary.ourOlineGoals += game.teamStats.goalSummary.ourOlineGoals;
          teamStats.goalSummary.theirDlineGoals += game.teamStats.goalSummary.theirDlineGoals;
          teamStats.goalSummary.theirOlineGoals += game.teamStats.goalSummary.theirOlineGoals;
        }
      });
      teamStats.totalPoints = teamStats.goalSummary.ourDlineGoals + teamStats.goalSummary.ourOlineGoals;
      teamStats.totalTurnovers = _.reduce($scope.playerStats, function (memo, value) {
        return memo += value.throwaways + value.drops + value.stalls;
      }, 0);
      teamStats.conversionRate = teamStats.totalPoints / (teamStats.totalPoints + teamStats.totalTurnovers);
      $scope.mostRecentGame = _.reduce($scope.allGames, function (memo, value) {
        if (memo) {
          return value.msSinceEpoch > memo.msSinceEpoch ? value : memo;
        } else {
          return value;
        }
      });
      $scope.mostRecentTournament = $scope.mostRecentGame.tournamentName;
      $scope.flowMap = deriveAssistFlowChart();
      $scope.teamStats = teamStats;
    };
    var deriveAssistFlowChart = function () {
      var goalCount = 0;
      var assistMap = {
          nodes: {},
          links: {}
        };
      _.each($scope.allGames, function (game) {
        if (game.isConsidered) {
          _.each(game.points, function (point) {
            var endEvent = point.events[point.events.length - 1];
            var penultimateEvent = point.events[point.events.length - 2];
            if (endEvent.type === 'Offense') {
              goalCount++;
              var passer = endEvent.passer + 'P';
              var receiver = endEvent.receiver + 'R';
              if (penultimateEvent && penultimateEvent.type === 'Offense') {
                var hPasser = penultimateEvent.passer + 'H';
                assistMap.nodes[hPasser] = true;
                addLink(hPasser, passer, assistMap);
              }
              assistMap.nodes[passer] = true;
              assistMap.nodes[receiver] = true;
              addLink(passer, receiver, assistMap);
            }
          });
        }
      });
      var nodes = [];
      var i = 0;
      var map = {};
      _.each(assistMap.nodes, function (value, key) {
        map[key] = i;
        nodes[i] = { name: key };
        i++;
      });
      assistMap.nodes = nodes;
      var links = [];
      _.each(assistMap.links, function (receivers, thrower) {
        _.each(receivers, function (quantity, receiver) {
          links.push({
            source: map[thrower],
            target: map[receiver],
            value: quantity
          });
        });
      });
      assistMap.links = links;
      return assistMap;
    };
    var addLink = function (passer, receiver, map) {
      if (map.links[passer]) {
        if (map.links[passer][receiver]) {
          map.links[passer][receiver] += 1;
        } else {
          map.links[passer][receiver] = 1;
        }
      } else {
        map.links[passer] = {};
        map.links[passer][receiver] = 1;
      }
    };
  }
]);
'use strict';
angular.module('iUtltimateApp').controller('GamespageCtrl', [
  '$scope',
  function ($scope) {
    $scope.$watch('teamStats', function () {
      if ($scope.allGames && $scope.allGames[0].playerStats) {
        $scope.allGames.sort(function (a, b) {
          return b.msSinceEpoch - a.msSinceEpoch;
        });
        $scope.lookAt($scope.allGames[0]);
      }
    });
    $scope.stats = {
      leaders: {
        plusMinusCount: {},
        goals: {},
        assists: {},
        ds: {},
        turnovers: {}
      }
    };
    $scope.derivePlayerFromName = function (name) {
      var player;
      _.each($scope.playerStats, function (value) {
        if (value.playerName === name) {
          player = value;
        }
      });
      return player;
    };
    $scope.contentFocus = 'Stats';
    var teamSide = function (side) {
      if ($scope.selectedPoint) {
        var sameAsFirst = ($scope.selectedPoint.summary.score.ours + $scope.selectedPoint.summary.score.theirs) % 2;
        var leftAtFirst = $scope.selectedGame.firstPointOline && !$scope.selectedGame.wind.leftToRight || !$scope.selectedGame.firstPointOline && $scope.selectedGame.wind.leftToRight;
        if (sameAsFirst && leftAtFirst || !sameAsFirst && !leftAtFirst) {
          $scope.leftSide = 'US';
          $scope.rightSide = 'THEM';
        } else {
          $scope.rightSide = 'US';
          $scope.leftSide = 'THEM';
        }
      }
    };
    var openPoints = {};
    $scope.toggleOpen = function (start) {
      openPoints[start] = !openPoints[start];
    };
    $scope.toggleAll = function (value) {
      _.each($scope.selectedGame.points, function (point) {
        openPoints[point.startSeconds] = value;
      });
    };
    $scope.selectPoint = function (point) {
      $scope.selectedPoint = point;
    };
    $scope.isOpenPoint = function (start) {
      if (openPoints[start]) {
        return 'open';
      } else {
        return '';
      }
    };
    $scope.isContentFocus = function (value) {
      return value === $scope.contentFocus ? 'active' : '';
    };
    $scope.changeContentFocus = function (value) {
      $scope.contentFocus = value;
    };
    $scope.lookAt = function (game) {
      $scope.selectedGame = game;
      $scope.consideredStats = game.playerStats;
      deriveRecord();
      deriveLeaders();
    };
    $scope.isSelected = function (id) {
      if ($scope.selectedGame) {
        if (id === $scope.selectedGame.gameId) {
          return 'active';
        } else {
          return '';
        }
      } else {
        return '';
      }
    };
    function deriveRecord() {
      var wins = 0;
      var losses = 0;
      _.each($scope.allGames, function (game) {
        if (game.opponentName === $scope.selectedGame.opponentName) {
          game.ours > game.theirs ? wins++ : losses++;
        }
      });
      $scope.record = wins + ' - ' + losses;
    }
    function deriveLeaders() {
      $scope.stats.leaders.goals = _.max($scope.selectedGame.playerStats, function (value) {
        return value.goals;
      });
      $scope.stats.leaders.assists = _.max($scope.selectedGame.playerStats, function (value) {
        return value.assists;
      });
      $scope.stats.leaders.ds = _.max($scope.selectedGame.playerStats, function (value) {
        return value.ds;
      });
      $scope.stats.leaders.turnovers = _.max($scope.selectedGame.playerStats, function (value) {
        value.turnovers = value.drops + value.throwaways + value.stalls;
        return value.turnovers;
      });
      $scope.stats.leaders.plusMinusCount = _.max($scope.selectedGame.playerStats, function (value) {
        return value.plusMinusCount;
      });
    }
    $scope.getEventDescription = function (event) {
      switch (event.action) {
      case 'Catch':
        return {
          text: event.passer + ' to ' + event.receiver,
          image: 'big_smile.png'
        };
      case 'Drop':
        return {
          text: event.receiver + ' dropped from ' + event.passer,
          image: 'eyes_droped.png'
        };
      case 'Throwaway':
        return {
          text: event.type == 'Offense' ? event.passer + ' throwaway' : 'Opponent throwaway',
          image: event.type == 'Offense' ? 'shame.png' : 'exciting.png'
        };
      case 'Stall':
        return {
          text: event.passer + ' stalled',
          image: 'shame.png'
        };
      case 'MiscPenalty':
        return {
          text: event.passer + ' penalized (caused turnover)',
          image: 'shame.png'
        };
      case 'D':
        return {
          text: 'D by ' + event.defender,
          image: 'electric_shock.png'
        };
      case 'Pull':
        return {
          text: 'Pull by ' + event.defender,
          image: 'nothing.png'
        };
      case 'PullOb':
        return {
          text: 'Pull (Out of Bounds) by ' + event.defender,
          image: 'what.png'
        };
      case 'Goal':
        return {
          text: event.type == 'Offense' ? 'Our Goal (' + event.passer + ' to ' + event.receiver + ')' : 'Their Goal',
          image: event.type == 'Offense' ? 'super_man.png' : 'cry.png'
        };
      case 'Callahan':
        return {
          text: 'Our Callahan (' + event.defender + ')',
          image: 'victory.png'
        };
      case 'EndOfFirstQuarter':
        return {
          text: 'End of 1st Quarter',
          image: 'stopwatch1.png'
        };
      case 'EndOfThirdQuarter':
        return {
          text: 'End of 3rd Quarter',
          image: 'stopwatch1.png'
        };
      case 'EndOfFourthQuarter':
        return {
          text: 'End of 4th Quarter',
          image: 'stopwatch1.png'
        };
      case 'EndOfOvertime':
        return {
          text: 'End of an Overtime',
          image: 'stopwatch1.png'
        };
      case 'Halftime':
        return {
          text: 'Halftime',
          image: 'stopwatch1.png'
        };
      case 'GameOver':
        return {
          text: 'Game Over',
          image: 'finishflag.png'
        };
      case 'Timeout':
        return {
          text: 'Timeout',
          image: 'stopwatch1.png'
        };
      default:
        return {
          text: event.action,
          image: 'hearts.png'
        };
      }
    };
    $scope.prettifyText = function (str) {
      switch (str) {
      case 'plusMinusCount':
        return '+/- Count';
        break;
      case 'goals':
        return 'Goals';
        break;
      case 'assists':
        return 'Assists';
        break;
      case 'ds':
        return 'D\'s';
        break;
      case 'turnovers':
        return 'Turnovers';
        break;
      }
    };
  }
]);
'use strict';
angular.module('iUtltimateApp').controller('DownloadpageCtrl', [
  '$scope',
  'Rest',
  function ($scope, Rest) {
    $scope.downloadUrl = Rest.urlForStatsExportFileDownload($scope.teamId, null);
  }
]);
'use strict';
angular.module('iUtltimateApp').controller('LinepageCtrl', [
  '$scope',
  function ($scope) {
    $scope.lines = [];
    $scope.dragging;
    $scope.dropped = function (line) {
      line.addPlayer($scope.dragging);
      $scope.dragging = undefined;
    };
    $scope.setDragging = function (player) {
      $scope.dragging = player;
    };
    $scope.makeLine = function () {
      $scope.lineCount++;
      $scope.lines.push(new Line());
    };
    $scope.deleteLine = function (index) {
      $scope.lines.splice(index, 1);
    };
    $scope.lineCount = 0;
    var Line = function () {
      this.players = [];
      this.considerablePoints = [];
    };
    Line.prototype.addPlayer = function (player) {
      if (!_.contains(this.players, player)) {
        this.players.push(player);
        this.deriveStats();
      }
    };
    Line.prototype.removePlayer = function (player) {
      _.each(this.players, function (playa, index) {
        if (playa.name === player.name) {
          this.players.splice(index, 1);
        }
      }, this);
      this.deriveStats();
    };
    Line.prototype.deriveStats = function () {
      this.considerablePoints = [];
      _.each($scope.allGames, function (game) {
        _.each(game.points, function (point) {
          var matchCount = 0;
          _.each(point.line, function (name) {
            _.each(this.players, function (player) {
              if (player.name === name) {
                matchCount++;
              }
            }, this);
          }, this);
          if (matchCount === this.players.length) {
            this.considerablePoints.push(point);
          }
        }, this);
      }, this);
      if (this.considerablePoints.length === 0) {
        this.stats = undefined;
      } else {
        this.stats = getLineStats(this.considerablePoints, this.players);
      }
    };
    $scope.makeLine();
    function getLineStats(points, players) {
      var perPointFunctions = [
          getScoringPercentage,
          getPlayerConnections,
          getP2P
        ];
      var stats = {};
      stats.accumulator = {};
      _.each(points, function (point, index) {
        var isLast = points.length - 1 === index;
        _.each(perPointFunctions, function (func) {
          func.call(null, point, stats, isLast, players);
        });
      });
      delete stats.accumulator;
      return stats;
    }
    function getScoringPercentage(point, stats, end) {
      stats.accumulator.oPointGoals = stats.accumulator.oPointGoals || 0;
      stats.accumulator.dPointGoals = stats.accumulator.dPointGoals || 0;
      stats.accumulator.oPoints = stats.accumulator.oPoints || 0;
      stats.accumulator.dPoints = stats.accumulator.dPoints || 0;
      if (point.events[0].type === 'Offense') {
        stats.accumulator.oPoints++;
        if (point.events[point.events.length - 1].type === 'Offense') {
          stats.accumulator.oPointGoals++;
        }
      } else {
        stats.accumulator.dPoints++;
        if (point.events[point.events.length - 1].type === 'Offense') {
          stats.accumulator.dPointGoals++;
        }
      }
      if (end) {
        stats.scoringPercentage = (stats.accumulator.oPointGoals + stats.accumulator.dPointGoals) / (stats.accumulator.oPoints + stats.accumulator.dPoints) || '?';
        stats.dScoringPercentage = stats.accumulator.dPointGoals / stats.accumulator.dPoints || '?';
        stats.oScoringPercentage = stats.accumulator.oPointGoals / stats.accumulator.oPoints || '?';
      }
    }
    function getPlayerConnections(point, stats, end, players) {
      stats.connections = stats.connections || {};
      _.each(point.events, function (evnt) {
        if (evnt.passer && evnt.receiver && contains(players, evnt.passer) && contains(players, evnt.receiver)) {
          stats.connections[getHash(evnt.passer, evnt.receiver)] = stats.connections[getHash(evnt.passer, evnt.receiver)] || {};
          stats.connections[getHash(evnt.passer, evnt.receiver)][evnt.action] = stats.connections[getHash(evnt.passer, evnt.receiver)][evnt.action] + 1 || 1;
        }
      });
    }
    function contains(players, name) {
      var found = false;
      _.each(players, function (player) {
        if (player.name === name) {
          found = true;
        }
      });
      return found;
    }
    function getHash(player1, player2) {
      if (player1 > player2) {
        return player1 + ' - ' + player2;
      } else {
        return player2 + ' - ' + player1;
      }
    }
    function getP2P(points) {
    }
    $scope.prettify = function (str) {
      switch (str) {
      case 'oScoringPercentage':
        return '% O-Points Scored';
        break;
      case 'dScoringPercentage':
        return '% D-Points Scored';
        break;
      case 'scoringPercentage':
        return '% Points Scored';
        break;
      }
      return str;
    };
  }
]);
'use strict';
angular.module('iUtltimateApp').controller('SpecificplayerpageCtrl', [
  '$scope',
  '$routeParams',
  '$location',
  function ($scope, $routeParams, $location) {
    $scope.$watch('selectedPlayerName', function () {
      if ($scope.selectedPlayerName) {
        $scope.$watch('playerStats', function () {
          if ($scope.playerStats) {
            _.each($scope.playerStats, function (player) {
              if (player.playerName === $scope.selectedPlayerName) {
                $scope.selectPlayer(player);
              }
            });
            !$scope.selectedPlayer && $location.url('/' + $scope.teamId + '/home');
          }
        });
      }
    });
    $scope.containsWord = function (input, target) {
      return input.indexOf(target) > -1;
    };
    $scope.targetMapHeight = Math.min($scope.windowHeight, 1100);
    $scope.targetData;
    $scope.key = {
      handlerColors: [
        '#c75aba',
        '#C3CE00',
        '#0faa00'
      ],
      cutterColors: [
        '#c5007c',
        '#949A27',
        '#298020'
      ],
      dropColors: [
        '#c75aba',
        '#c5007c'
      ],
      goalColors: [
        '#0faa00',
        '#298020'
      ],
      catchColors: [
        '#C3CE00',
        '#949A27'
      ],
      throwawayColor: '#ff9400'
    };
    $scope.hasPositions = _.reduce($scope.players, function (memo, player) {
      return memo || player.position === 'Handler';
    }, false);
    $scope.isInt = function (num) {
      if (typeof num === 'string') {
        return true;
      }
      return num % 1 === 0;
    };
    $scope.fixNum = function (num, type) {
      if (typeof num === 'string') {
        return num;
      }
      if (type === 'pullsAvgHangtimeMillis') {
        return (num / 1000).toFixed(2);
      }
      if (type === 'secondsPlayed') {
        return (num / 60).toFixed(2);
      }
      return num;
    };
    $scope.prettify = function (str) {
      str = str.replace('PP', ' Per Point');
      switch (str) {
      case 'dpointsPlayed':
        return 'D Points Played';
        break;
      case 'callahaneds':
        return 'Callahaned\'s';
        break;
      case 'catchSuccess':
        return 'Catch Success';
        break;
      case 'gamesPlayed':
        return 'Games Played';
        break;
      case 'miscPenalties':
        return 'Misc. Penalties';
        break;
      case 'opointsPlayed':
        return 'O Points Played';
        break;
      case 'passSuccess':
        return '% Passes Caught';
        break;
      case 'passerTurnovers':
        return 'Passer Turnovers';
        break;
      case 'secondsPlayed':
        return 'Minutes Played';
        break;
      case 'pullsAvgHangtimeMillis':
        return 'Avg. Pull Hangtime (secs)';
        break;
      case 'pullsOB':
        return 'OB Pulls';
        break;
      case 'pullsWithHangtime':
        return 'Pulls With Hangtime';
        break;
      case 'plusMinusCount':
        return '+/-';
        break;
      case 'plusMinusDLine':
        return 'D-Line +/-';
        break;
      case 'plusMinusOLine':
        return 'O-Line +/-';
        break;
      case 'pointsPlayed':
        return 'Points Played';
        break;
      default:
        return str.charAt(0).toUpperCase() + str.slice(1);
        break;
      }
    };
    $scope.$watch('selectedPlayer', function () {
      var consideredEvents = [];
      var targetMap = {};
      var targetData = [];
      $scope.targetData = undefined;
      if ($scope.playerStats && $scope.selectedPlayer) {
        _.each($scope.allGames, function (game) {
          if (game.isConsidered) {
            _.each(game.points, function (point) {
              _.each(point.line, function (playerName) {
                if (playerName === $scope.selectedPlayer.playerName) {
                  _.each(point.events, function (event) {
                    if (event.type === 'Offense' && event.passer === $scope.selectedPlayer.playerName) {
                      consideredEvents.push(event);
                    }
                  });
                }
              });
            });
          }
        });
        _.each(consideredEvents, function (event) {
          targetMap[event.action] = targetMap[event.action] || {};
          targetMap[event.action][encodeURI(event.receiver)] = ++targetMap[event.action][encodeURI(event.receiver)] || 1;
        });
        _.each(targetMap, function (receivers, action) {
          _.each(receivers, function (count, receiver) {
            if (receiver === 'undefined')
              receiver = 'The Other Team';
            targetData.push({
              actionType: action,
              receiver: decodeURI(receiver),
              value: count
            });
          });
        });
        $scope.targetData = { children: targetData };
      }
    }, true);
  }
]);