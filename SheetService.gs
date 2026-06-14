/**
 * SheetService.gs
 * Core utility services for Google Sheets database interactions.
 */

var SheetService = (function() {
  /**
   * Gets the active spreadsheet.
   */
  function getSpreadsheet() {
    try {
      return SpreadsheetApp.getActiveSpreadsheet();
    } catch(e) {
      Logger.log("Error getting active spreadsheet: " + e.toString());
      throw new Error("Không thể truy cập Google Sheets. Hãy đảm bảo Script được liên kết với một Google Sheet.");
    }
  }

  /**
   * Gets a sheet by name or creates it with headers if it doesn't exist.
   * @param {string} name - The sheet name
   * @param {string[]} headers - The headers for the sheet
   * @return {Sheet} The Google Sheet object
   */
  function getOrCreateSheet(name, headers) {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      if (headers && headers.length > 0) {
        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#d0e0f3");
        sheet.setFrozenRows(1);
      }
    }
    return sheet;
  }

  /**
   * Reads a sheet and converts its content into an array of objects based on headers.
   * @param {string} name - The sheet name
   * @return {object[]} Array of objects
   */
  function getSheetDataAsObjects(name) {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(name);
    if (!sheet) return [];
    
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow <= 1) return [];

    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    
    return data.map(function(row) {
      var obj = {};
      headers.forEach(function(header, idx) {
        if (header) {
          obj[header] = row[idx];
        }
      });
      return obj;
    });
  }

  /**
   * Overwrites a sheet's data with an array of objects.
   * @param {string} name - The sheet name
   * @param {string[]} headers - Header columns in desired order
   * @param {object[]} objects - Data rows as objects
   */
  function setSheetDataFromObjects(name, headers, objects) {
    var sheet = getOrCreateSheet(name, headers);
    
    // Clear existing data (keep headers)
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
    
    if (!objects || objects.length === 0) return;

    var values = objects.map(function(obj) {
      return headers.map(function(header) {
        return obj.hasOwnProperty(header) ? obj[header] : "";
      });
    });

    sheet.getRange(2, 1, values.length, headers.length).setValues(values);
  }

  /**
   * Appends a single object as a row.
   * @param {string} name - The sheet name
   * @param {string[]} headers - Header columns
   * @param {object} obj - Object data to write
   */
  function appendRowFromObject(name, headers, obj) {
    var sheet = getOrCreateSheet(name, headers);
    var rowValues = headers.map(function(header) {
      return obj.hasOwnProperty(header) ? obj[header] : "";
    });
    sheet.appendRow(rowValues);
  }

  /**
   * Updates a cell in a sheet by looking up a row matching a lookup key/value.
   * If the row does not exist, appends a new row and updates it.
   * @param {string} name - The sheet name
   * @param {string[]} headers - Column headers for fallback creation
   * @param {string} lookupHeader - Header column to match
   * @param {string} lookupValue - Value to search for
   * @param {string} targetHeader - Header column to update
   * @param {any} newValue - New value to set
   */
  function updateCellByLookup(name, headers, lookupHeader, lookupValue, targetHeader, newValue) {
    var sheet = getOrCreateSheet(name, headers);
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    
    var sheetHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var lookupColIdx = sheetHeaders.indexOf(lookupHeader);
    var targetColIdx = sheetHeaders.indexOf(targetHeader);
    
    if (lookupColIdx === -1 || targetColIdx === -1) {
      throw new Error("Không tìm thấy tiêu đề cột: " + lookupHeader + " hoặc " + targetHeader);
    }
    
    var foundRowIdx = -1;
    if (lastRow > 1) {
      var lookupValues = sheet.getRange(2, lookupColIdx + 1, lastRow - 1, 1).getValues();
      for (var i = 0; i < lookupValues.length; i++) {
        // Compare values, converting to string to prevent date mismatch errors
        var valStr = lookupValues[i][0] instanceof Date 
          ? Utilities.formatDate(lookupValues[i][0], "GMT+7", "dd/MM/yyyy") 
          : String(lookupValues[i][0]);
          
        var searchStr = lookupValue instanceof Date 
          ? Utilities.formatDate(lookupValue, "GMT+7", "dd/MM/yyyy") 
          : String(lookupValue);

        if (valStr.trim() === searchStr.trim()) {
          foundRowIdx = i + 2; // 1-indexed, and skip headers
          break;
        }
      }
    }
    
    if (foundRowIdx !== -1) {
      var cell = sheet.getRange(foundRowIdx, targetColIdx + 1);
      cell.setValue(newValue);
      cell.setWrap(true);
      cell.setVerticalAlignment("top");
    } else {
      // Create new object, fill lookup column and target column, and append
      var obj = {};
      obj[lookupHeader] = lookupValue;
      obj[targetHeader] = newValue;
      appendRowFromObject(name, headers, obj);
      
      // Get the newly appended row to format
      var newRowIdx = sheet.getLastRow();
      var cell = sheet.getRange(newRowIdx, targetColIdx + 1);
      cell.setWrap(true);
      cell.setVerticalAlignment("top");
      
      // Also set the lookup column center aligned
      sheet.getRange(newRowIdx, lookupColIdx + 1).setHorizontalAlignment("center").setFontWeight("bold");
    }
  }

  return {
    getSpreadsheet: getSpreadsheet,
    getOrCreateSheet: getOrCreateSheet,
    getSheetDataAsObjects: getSheetDataAsObjects,
    setSheetDataFromObjects: setSheetDataFromObjects,
    appendRowFromObject: appendRowFromObject,
    updateCellByLookup: updateCellByLookup
  };
})();
