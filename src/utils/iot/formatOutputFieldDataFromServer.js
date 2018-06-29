import * as iotUtils from './index';

/**
 * Normalizes the output field data and metadata returned from the API server
 *
 * @returns {Object} input
 * @returns {Object} input.meta Metadata about the output field data query
 * @returns {Number} input.meta.count Total number of field data records found
 * @returns {Boolean} input.meta.hasMore Indicates if there are more records
 *   to retrieve
 * @returns {String} [input.meta.nextPageUrl] URL that can be used to request
 *   the next page of results
 * @returns {Number} [input.meta.nextRecordTime] UNIX timestamp indicating a
 *   `timeStart` that would return new values
 *
 * @returns {Object} output
 * @returns {Object} output.meta Metadata about the request
 * @returns {Number} output.meta.count Total number of field data records
 * @returns {Boolean} output.meta.hasMore Indicates if there are more records
 *   to retrieve
 * @returns {Number} [output.meta.limit = 5000] Number of records to return
 * @returns {Number} [output.nextRecordTime] UNIX timestamp indicating a
 *   `timeStart` that would return new values
 * @returns {Number} [output.meta.timeEnd] UNIX timestamp indicating the end of
 *   the query window
 * @returns {Number} [output.meta.timeStart] UNIX timestamp indicating the
 *   start of the query window
 * @returns {Number} [output.meta.window] The sampling window for records.
 *   Required if including a timeEnd or timeStart.
 *   Valid options include: `0`, `60`, `900`, and `3600`
 * @returns {OutputFieldData[]} output.records
 *
 * @private
 */
function formatOutputFieldDataFromServer(input = {}) {
  const meta = input.meta || {};
  const query = iotUtils.parseOutputFieldNextPageUrlMetadata(
    meta.next_page_url
  );
  const records = input.records || [];

  return {
    meta: {
      ...query,
      count: meta.count,
      hasMore: meta.has_more,
      nextRecordTime: meta.next_record_time
    },
    records: records.map((record) => ({
      eventTime: record.event_time,
      value: record.value
    }))
  };
}

export default formatOutputFieldDataFromServer;