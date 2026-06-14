/**
 * Code.gs
 * Main entry point and API route dispatcher for King's Grill Checklist Web App.
 */

function runAuth() {
  getAppInitData(todayISO());
}

function todayISO() {
  var d = new Date();
  var off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

function doGet(e) {
  // Automatically initialize checklist templates on load
  try {
    ChecklistService.initDefaultChecklist();
  } catch(err) {
    Logger.log("Initialization error: " + err.toString());
  }

  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle("KG Checklist Công Việc")
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Embeds code from sub-html files directly into Index.html.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Standard utility wrapper for API endpoints to format response uniformly.
 */
function runApi(serviceFn, args) {
  try {
    var data = serviceFn.apply(null, args || []);
    return {
      success: true,
      data: data,
      message: "Thao tác thành công!"
    };
  } catch(e) {
    Logger.log("API Error: " + e.toString() + "\nStack: " + e.stack);
    return {
      success: false,
      error: e.message || "Đã xảy ra lỗi không xác định trên hệ thống.",
      details: e.toString()
    };
  }
}

// ==========================================
// PUBLIC BACKEND API ENDPOINTS
// ==========================================

/**
 * Loads the initial webapp configurations and raw progress checklist states for a specific date.
 */
function getAppInitData(dateStr) {
  return runApi(function() {
    // Make sure defaults are set up
    ChecklistService.initDefaultChecklist();
    
    return {
      checklist: ChecklistService.loadChecklistFromSheet(),
      states: ChecklistService.getChecklistStates(dateStr)
    };
  });
}

/**
 * Saves the checklist progress of a specific zone/day and writes the report summary.
 */
function saveChecklistState(dateStr, area, participants, items, supply, signatures) {
  return runApi(function() {
    return ChecklistService.saveChecklistState(dateStr, area, participants, items, supply, signatures);
  });
}

/**
 * Handles incoming POST requests (API endpoints) when hosted on external platforms like Cloudflare Pages.
 */
function doPost(e) {
  try {
    var requestData = JSON.parse(e.postData.contents);
    var methodName = requestData.method;
    var args = requestData.args || [];
    
    // Whitelist allowed API methods for security
    var allowedMethods = ["getAppInitData", "saveChecklistState"];

    if (allowedMethods.indexOf(methodName) === -1) {
      throw new Error("Method not allowed: " + methodName);
    }

    var func = this[methodName];
    if (typeof func !== "function") {
      throw new Error("Method not found: " + methodName);
    }

    var result = func.apply(null, args);
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    var errorResult = {
      success: false,
      error: err.message || err.toString()
    };
    return ContentService.createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
