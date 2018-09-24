// FAERS API Request Helpers

var underscore = require('underscore');
var escape = require('escape-html');

var EXPECTED_PARAMS = ['search', 'count', 'limit', 'skip', 'sort'],
    maxSkip = 25000;

exports.API_REQUEST_ERROR = 'ApiRequestError';
var API_REQUEST_ERROR = exports.API_REQUEST_ERROR;

exports.CheckParams = function(params) {
  // Ensure we only have params that are expected.
  underscore.each(underscore.keys(params), function(param) {
    if (EXPECTED_PARAMS.indexOf(param) == -1) {
      throw {
        name: API_REQUEST_ERROR,
        message: 'Invalid parameter: ' + escape(param)
      };
    }
  });

  if (params.limit) {
    var limit = parseInt(params.limit);
    if (isNaN(limit) || !/^\d+$/.test(params.limit.trim())) {
      throw {
        name: API_REQUEST_ERROR,
        message: 'Invalid limit parameter value.'
      };
    }
    params.limit = limit;
  }

  if (params.skip) {
    var skip = parseInt(params.skip);
    if (isNaN(skip) || !/^\d+$/.test(params.skip.trim())) {
      throw {
        name: API_REQUEST_ERROR,
        message: 'Invalid skip parameter value.'
      };
    }
    if (skip > maxSkip) {
      throw {
        name: API_REQUEST_ERROR,
        message: 'Skip value must ' + maxSkip + ' or less.'
      }
    }
    params.skip = skip;
  }

  // Limit to 100 results per search request.
  if (!params.count && params.limit && params.limit > 100) {
    throw {
      name: API_REQUEST_ERROR,
      message: 'Limit cannot exceed 100 results for search requests. Use ' +
        'the skip param to get additional results.'
    };
  }

  // Limit to 1000 results per count request.
  if (params.count && params.limit && params.limit > 1000) {
    throw {
      name: API_REQUEST_ERROR,
      message: 'Limit cannot exceed 1000 results for count requests.'
    };
  }

  // Do not allow skip param with count requests.
  if (params.count && params.skip) {
    throw {
      name: API_REQUEST_ERROR,
      message: 'Should not use skip param when using count.'
    };
  }

  // Set default values for missing params
  params.skip = params.skip || 0;
  if (!params.limit && params.limit !== 0) {
    if (params.count) {
      params.limit = 100;
    } else {
      params.limit = 1;
    }
  }

  var clean_params = {};
  underscore.extend(clean_params,
    underscore.pick(params, EXPECTED_PARAMS));

  return clean_params;
};
