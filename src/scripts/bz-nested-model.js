angular.module('bzNestedModel', []).factory('bzNestedResource', ['$resource', '$q', '$rootScope', function ($resource, $q, $rootScope) {
    function ResourceFactory(url, paramDefaults, actions) {
        var defaultActions = {
            update: { method: 'POST' },
            create: { method: 'PUT', params: { 'insert': true } },
            move: { method: 'PUT', params: { 'move': true } }
        };
        actions = angular.extend(defaultActions, actions);
        var resource = $resource(url, paramDefaults, actions);

        function walk(items, parent) {
            parent = parent || null;
            for (var i = 0, max = items.length; i < max; i++) {
                if (!items[i].children) {
                    items[i].children = [];
                }
                if (!(items[i] instanceof resource)) {
                    items[i] = new resource(items[i]);
                }
                if (items[i].children.length) {
                    walk(items[i].children, items[i]);
                }
            }
        }

        resource.prototype.$insertItem = function (cb) {
            cb = cb || angular.noop;
            var currentItem = this,
                clone = angular.copy(this); // clone object because angular resource update original data
            return clone.$create({ 'id': currentItem.id }, function (item) {
                item.children = [];
                currentItem.$expanded = true;
                currentItem.children.unshift(item);
                if (!$rootScope.$$phase) {
                    $rootScope.$apply();
                }
                cb(item);
            });
        };
        resource.prototype.$moveItem = function (before, position, cb) {
            cb = cb || angular.noop;
            var clone = new resource(this);
            return clone.$move({ 'id': this.id, 'insert': position == 0, 'before': before.id }, function (item) {
                cb(item);
            });
        };
        resource.getTree = function (data, cb) {
            cb = cb || angular.noop;
            if (typeof data == 'function') {
                cb = data;
                data = {};
            }
            var def = $q.defer();
            resource.get(data, function (result) {
                walk(result.children);
                def.resolve(result);
                cb(result);
            });
            return def.promise;
        };

        var findWalk = function (data, iterator, parents) {
            parents = parents || [];
            if (angular.isUndefined(data)) {
                return null;
            }
            if (iterator.call(this, data)) {
                return data;
            }
            var res = null;
            for (var i = 0, max = data.children.length; i < max; i++) {
                res = findWalk(data.children[i], iterator, parents);
                if (res) {
                    parents.push(data.children[i]);
                    break;
                }
            }
            return res;
        };
        resource.find = function (data, iterator, parents) {
            return findWalk(data, iterator, parents);
        };
        return resource;
    }

    return ResourceFactory;
}]);