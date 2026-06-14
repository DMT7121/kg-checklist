/**
 * ChecklistService.gs
 * Handles loading checklist definitions, saving/loading raw progress,
 * and generating the monthly tracking sheets.
 */

var ChecklistService = (function() {
  var CONFIG_SHEET = "01_DANH_SACH_CHECKLIST";
  var STATE_SHEET = "02_LUU_TRU_TIEN_DO";
  
  var CONFIG_HEADERS = [
    "Mã Hạng Mục", "STT", "Phân Loại", "Ca Làm Việc", "Phần", 
    "Tiêu Đề", "Mô Tả", "Mã Việc Con", "Nội Dung Việc Con"
  ];
  
  var STATE_HEADERS = [
    "Ngày", "Khu vực", "Nhân viên", "Dữ liệu JSON", "Thời gian cập nhật"
  ];

  /**
   * Initializes the default checklist definitions in the spreadsheet.
   */
  function initDefaultChecklist() {
    var sheet = SheetService.getOrCreateSheet(CONFIG_SHEET, CONFIG_HEADERS);
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) return; // Already initialized

    var defaults = [
      // PHASE 1: SETUP BÀN (CA 15H)
      { id: "start_clean_floor", no: 1, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "I. Vệ sinh & setup khu trực", title: "Vệ sinh sàn & Khu vực chung", desc: "Quét và lau sạch tổng thể khu trực. Quét dọn sạch sẽ khu vực cổng ra vào.", subId: "floor_sweep", subText: "Quét sạch tổng thể sàn khu trực" },
      { id: "start_clean_floor", no: 1, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "I. Vệ sinh & setup khu trực", title: "Vệ sinh sàn & Khu vực chung", desc: "Quét và lau sạch tổng thể khu trực. Quét dọn sạch sẽ khu vực cổng ra vào.", subId: "floor_mop", subText: "Lau sàn, xử lý vết bẩn dễ thấy" },
      { id: "start_clean_floor", no: 1, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "I. Vệ sinh & setup khu trực", title: "Vệ sinh sàn & Khu vực chung", desc: "Quét và lau sạch tổng thể khu trực. Quét dọn sạch sẽ khu vực cổng ra vào.", subId: "gate_clean", subText: "Quét dọn sạch khu vực cổng ra vào" },
      { id: "start_clean_floor", no: 1, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "I. Vệ sinh & setup khu trực", title: "Vệ sinh sàn & Khu vực chung", desc: "Quét và lau sạch tổng thể khu trực. Quét dọn sạch sẽ khu vực cổng ra vào.", subId: "corner_check", subText: "Kiểm tra góc khuất, gầm/tủ gần khu trực" },

      { id: "start_table_setup", no: 2, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "I. Vệ sinh & setup khu trực", title: "Bàn ghế", desc: "Lau sạch bàn ghế, setup tiêu chuẩn/đủ dụng cụ: Chén, Đũa, Muỗng, Ly. Bố trí đầy đủ theo lịch đặt bàn.", subId: "table_wipe", subText: "Lau sạch mặt bàn" },
      { id: "start_table_setup", no: 2, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "I. Vệ sinh & setup khu trực", title: "Bàn ghế", desc: "Lau sạch bàn ghế, setup tiêu chuẩn/đủ dụng cụ: Chén, Đũa, Muỗng, Ly. Bố trí đầy đủ theo lịch đặt bàn.", subId: "chair_wipe", subText: "Lau sạch ghế và sắp xếp ngay ngắn" },
      { id: "start_table_setup", no: 2, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "I. Vệ sinh & setup khu trực", title: "Bàn ghế", desc: "Lau sạch bàn ghế, setup tiêu chuẩn/đủ dụng cụ: Chén, Đũa, Muỗng, Ly. Bố trí đầy đủ theo lịch đặt bàn.", subId: "tableware_ready", subText: "Setup đủ chén, đũa, muỗng, ly" },
      { id: "start_table_setup", no: 2, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "I. Vệ sinh & setup khu trực", title: "Bàn ghế", desc: "Lau sạch bàn ghế, setup tiêu chuẩn/đủ dụng cụ: Chén, Đũa, Muỗng, Ly. Bố trí đầy đủ theo lịch đặt bàn.", subId: "reservation_layout", subText: "Bố trí bàn ghế đúng lịch đặt bàn" },

      { id: "start_background", no: 3, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "I. Vệ sinh & setup khu trực", title: "Background tiệc", desc: "Lau bụi background/vật dụng trang trí.", subId: "bg_dust", subText: "Lau bụi background và vật dụng trang trí" },
      { id: "start_background", no: 3, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "I. Vệ sinh & setup khu trực", title: "Background tiệc", desc: "Lau bụi background/vật dụng trang trí.", subId: "decor_check", subText: "Kiểm tra hoa/nến/decor nếu có" },
      { id: "start_background", no: 3, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "I. Vệ sinh & setup khu trực", title: "Background tiệc", desc: "Lau bụi background/vật dụng trang trí.", subId: "decor_report", subText: "Báo quản lý nếu decor hỏng, thiếu hoặc lệch tông" },

      { id: "start_tools_check", no: 4, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "II. Công cụ & Vật tư", title: "Diêm/bật lửa, khăn giấy, hộp/bịch mang về", desc: "Kiểm tra đủ diêm/bật lửa, khăn giấy, hộp/bịch mang về và các vật tư thường dùng.", subId: "match_lighter", subText: "Kiểm tra diêm/bật lửa" },
      { id: "start_tools_check", no: 4, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "II. Công cụ & Vật tư", title: "Diêm/bật lửa, khăn giấy, hộp/bịch mang về", desc: "Kiểm tra đủ diêm/bật lửa, khăn giấy, hộp/bịch mang về và các vật tư thường dùng.", subId: "tissue_ready", subText: "Kiểm tra khăn giấy" },
      { id: "start_tools_check", no: 4, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "II. Công cụ & Vật tư", title: "Diêm/bật lửa, khăn giấy, hộp/bịch mang về", desc: "Kiểm tra đủ diêm/bật lửa, khăn giấy, hộp/bịch mang về và các vật tư thường dùng.", subId: "takeaway_ready", subText: "Kiểm tra hộp/bịch mang về" },
      { id: "start_tools_check", no: 4, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "II. Công cụ & Vật tư", title: "Diêm/bật lửa, khăn giấy, hộp/bịch mang về", desc: "Kiểm tra đủ diêm/bật lửa, khăn giấy, hộp/bịch mang về và các vật tư thường dùng.", subId: "supply_shortage", subText: "Ghi nhận vật tư thiếu để đề xuất cấp thêm" },

      { id: "start_station_arrange", no: 5, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "II. Công cụ & Vật tư", title: "Sắp xếp", desc: "Gọn gàng tủ đồ, bố trí các trạm đồ dùng dự phòng để giảm tải khi đông khách.", subId: "cabinet_tidy", subText: "Sắp xếp gọn tủ đồ khu trực" },
      { id: "start_station_arrange", no: 5, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "II. Công cụ & Vật tư", title: "Sắp xếp", desc: "Gọn gàng tủ đồ, bố trí các trạm đồ dùng dự phòng để giảm tải khi đông khách.", subId: "station_ready", subText: "Bố trí trạm đồ dùng dự phòng" },
      { id: "start_station_arrange", no: 5, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "II. Công cụ & Vật tư", title: "Sắp xếp", desc: "Gọn gàng tủ đồ, bố trí các trạm đồ dùng dự phòng để giảm tải khi đông khách.", subId: "tool_easy_access", subText: "Đặt dụng cụ ở vị trí dễ lấy khi đông khách" },
      { id: "start_station_arrange", no: 5, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "II. Công cụ & Vật tư", title: "Sắp xếp", desc: "Gọn gàng tủ đồ, bố trí các trạm đồ dùng dự phòng để giảm tải khi đông khách.", subId: "station_clean", subText: "Kiểm tra trạm không bừa bộn, không lẫn đồ hư" },

      { id: "start_reserved_setup", no: 6, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "III. Bàn đặt trước", title: "Setup bàn đặt", desc: "Đủ số lượng, đúng tông màu, đúng nhu cầu tiệc, đã chuẩn bị đầy đủ theo thông tin đặt trước.", subId: "reserved_count", subText: "Kiểm tra đủ số lượng bàn/ghế" },
      { id: "start_reserved_setup", no: 6, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "III. Bàn đặt trước", title: "Setup bàn đặt", desc: "Đủ số lượng, đúng tông màu, đúng nhu cầu tiệc, đã chuẩn bị đầy đủ theo thông tin đặt trước.", subId: "reserved_theme", subText: "Đúng tông màu/trang trí theo yêu cầu" },
      { id: "start_reserved_setup", no: 6, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "III. Bàn đặt trước", title: "Setup bàn đặt", desc: "Đủ số lượng, đúng tông màu, đúng nhu cầu tiệc, đã chuẩn bị đầy đủ theo thông tin đặt trước.", subId: "reserved_need", subText: "Đúng nhu cầu tiệc: sinh nhật, liên hoan, gia đình..." },
      { id: "start_reserved_setup", no: 6, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "III. Bàn đặt trước", title: "Setup bàn đặt", desc: "Đủ số lượng, đúng tông màu, đúng nhu cầu tiệc, đã chuẩn bị đầy đủ theo thông tin đặt trước.", subId: "reserved_food_drink", subText: "Nắm món/đồ uống đặt trước nếu có" },

      { id: "start_reserved_mark", no: 7, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "III. Bàn đặt trước", title: "Đánh dấu", desc: "Cắm khăn giấy nhận diện hoặc đặt bảng “Bàn đặt trước”.", subId: "reserved_tissue", subText: "Cắm khăn giấy nhận diện bàn đặt trước" },
      { id: "start_reserved_mark", no: 7, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "III. Bàn đặt trước", title: "Đánh dấu", desc: "Cắm khăn giấy nhận diện hoặc đặt bảng “Bàn đặt trước”.", subId: "reserved_sign", subText: "Đặt bảng “Bàn đặt trước” nếu cần" },
      { id: "start_reserved_mark", no: 7, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "III. Bàn đặt trước", title: "Đánh dấu", desc: "Cắm khăn giấy nhận diện hoặc đặt bảng “Bàn đặt trước”.", subId: "reserved_position", subText: "Kiểm tra đúng vị trí, tránh nhầm bàn" },

      { id: "start_handover_receive", no: 8, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "IV. Bàn giao đầu ca", title: "Nhận bàn giao", desc: "Kiểm tra tài sản/thông tin từ ca trước. Báo cáo bàn giao đầu ca, phản hồi sai sót nếu có.", subId: "handover_assets", subText: "Kiểm tra tài sản/dụng cụ được bàn giao" },
      { id: "start_handover_receive", no: 8, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "IV. Bàn giao đầu ca", title: "Nhận bàn giao", desc: "Kiểm tra tài sản/thông tin từ ca trước. Báo cáo bàn giao đầu ca, phản hồi sai sót nếu có.", subId: "handover_info", subText: "Nắm thông tin tồn đọng từ ca trước" },
      { id: "start_handover_receive", no: 8, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "IV. Bàn giao đầu ca", title: "Nhận bàn giao", desc: "Kiểm tra tài sản/thông tin từ ca trước. Báo cáo bàn giao đầu ca, phản hồi sai sót nếu có.", subId: "handover_issue", subText: "Phản hồi sai sót nếu có" },
      { id: "start_handover_receive", no: 8, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "IV. Bàn giao đầu ca", title: "Nhận bàn giao", desc: "Kiểm tra tài sản/thông tin từ ca trước. Báo cáo bàn giao đầu ca, phản hồi sai sót nếu có.", subId: "handover_report", subText: "Báo cáo lại cho tổ trưởng/quản lý" },

      // PHASE 2: RÀ SOÁT & HOÀN THIỆN (CA 17H)
      { id: "mid_double_check", no: 9, phase: "CHECKLIST ĐẦU CA", shift: "CA 17H: RÀ SOÁT & HOÀN THIỆN", section: "V. Kiểm tra chéo & Bổ sung", title: "Double-check ca 15h", desc: "Hoàn thành các việc tồn đọng của đầu ca.", subId: "double_clean", subText: "Rà soát vệ sinh khu vực" },
      { id: "mid_double_check", no: 9, phase: "CHECKLIST ĐẦU CA", shift: "CA 17H: RÀ SOÁT & HOÀN THIỆN", section: "V. Kiểm tra chéo & Bổ sung", title: "Double-check ca 15h", desc: "Hoàn thành các việc tồn đọng của đầu ca.", subId: "double_setup", subText: "Rà soát setup bàn ghế/dụng cụ" },
      { id: "mid_double_check", no: 9, phase: "CHECKLIST ĐẦU CA", shift: "CA 17H: RÀ SOÁT & HOÀN THIỆN", section: "V. Kiểm tra chéo & Bổ sung", title: "Double-check ca 15h", desc: "Hoàn thành các việc tồn đọng của đầu ca.", subId: "double_reserved", subText: "Rà soát bàn đặt trước" },
      { id: "mid_double_check", no: 9, phase: "CHECKLIST ĐẦU CA", shift: "CA 17H: RÀ SOÁT & HOÀN THIỆN", section: "V. Kiểm tra chéo & Bổ sung", title: "Double-check ca 15h", desc: "Hoàn thành các việc tồn đọng của đầu ca.", subId: "double_pending", subText: "Xử lý việc tồn đọng hoặc báo quản lý" },

      { id: "mid_table_ready", no: 10, phase: "CHECKLIST ĐẦU CA", shift: "CA 17H: RÀ SOÁT & HOÀN THIỆN", section: "V. Kiểm tra chéo & Bổ sung", title: "Chuẩn bị cho bàn ăn", desc: "Kiểm tra nước chấm, khăn lạnh, đồ uống đặt trước.", subId: "sauce_ready", subText: "Chuẩn bị/kiểm tra nước chấm" },
      { id: "mid_table_ready", no: 10, phase: "CHECKLIST ĐẦU CA", shift: "CA 17H: RÀ SOÁT & HOÀN THIỆN", section: "V. Kiểm tra chéo & Bổ sung", title: "Chuẩn bị cho bàn ăn", desc: "Kiểm tra nước chấm, khăn lạnh, đồ uống đặt trước.", subId: "cold_towel_ready", subText: "Chuẩn bị/kiểm tra khăn lạnh" },
      { id: "mid_table_ready", no: 10, phase: "CHECKLIST ĐẦU CA", shift: "CA 17H: RÀ SOÁT & HOÀN THIỆN", section: "V. Kiểm tra chéo & Bổ sung", title: "Chuẩn bị cho bàn ăn", desc: "Kiểm tra nước chấm, khăn lạnh, đồ uống đặt trước.", subId: "pre_drink_ready", subText: "Kiểm tra đồ uống đặt trước" },
      { id: "mid_table_ready", no: 10, phase: "CHECKLIST ĐẦU CA", shift: "CA 17H: RÀ SOÁT & HOÀN THIỆN", section: "V. Kiểm tra chéo & Bổ sung", title: "Chuẩn bị cho bàn ăn", desc: "Kiểm tra nước chấm, khăn lạnh, đồ uống đặt trước.", subId: "table_extra_ready", subText: "Bổ sung dụng cụ nếu thiếu" },

      { id: "mid_devices_on", no: 11, phase: "CHECKLIST ĐẦU CA", shift: "CA 17H: RÀ SOÁT & HOÀN THIỆN", section: "V. Kiểm tra chéo & Bổ sung", title: "Bật các thiết bị cần thiết", desc: "Bật đèn sảnh, đèn trang trí, quạt/máy lạnh theo nhu cầu vận hành.", subId: "light_hall", subText: "Bật đèn sảnh/khu vực phục vụ" },
      { id: "mid_devices_on", no: 11, phase: "CHECKLIST ĐẦU CA", shift: "CA 17H: RÀ SOÁT & HOÀN THIỆN", section: "V. Kiểm tra chéo & Bổ sung", title: "Bật các thiết bị cần thiết", desc: "Bật đèn sảnh, đèn trang trí, quạt/máy lạnh theo nhu cầu vận hành.", subId: "light_decor", subText: "Bật đèn trang trí" },
      { id: "mid_devices_on", no: 11, phase: "CHECKLIST ĐẦU CA", shift: "CA 17H: RÀ SOÁT & HOÀN THIỆN", section: "V. Kiểm tra chéo & Bổ sung", title: "Bật các thiết bị cần thiết", desc: "Bật đèn sảnh, đèn trang trí, quạt/máy lạnh theo nhu cầu vận hành.", subId: "fan_ac", subText: "Bật quạt/máy lạnh phù hợp" },
      { id: "mid_devices_on", no: 11, phase: "CHECKLIST ĐẦU CA", shift: "CA 17H: RÀ SOÁT & HOÀN THIỆN", section: "V. Kiểm tra chéo & Bổ sung", title: "Bật các thiết bị cần thiết", desc: "Bật đèn sảnh, đèn trang trí, quạt/máy lạnh theo nhu cầu vận hành.", subId: "device_check", subText: "Kiểm tra thiết bị hoạt động bình thường" },

      { id: "mid_daily_info", no: 12, phase: "CHECKLIST ĐẦU CA", shift: "CA 17H: RÀ SOÁT & HOÀN THIỆN", section: "VI. Thông tin và kế hoạch trong ngày", title: "Nắm thông tin", desc: "Bàn đặt mới, sắp xếp/trang trí bàn, món hết hàng/ngừng bán, món ưu tiên bán, chương trình khuyến mãi.", subId: "info_reservation", subText: "Nắm bàn đặt mới trong ngày" },
      { id: "mid_daily_info", no: 12, phase: "CHECKLIST ĐẦU CA", shift: "CA 17H: RÀ SOÁT & HOÀN THIỆN", section: "VI. Thông tin và kế hoạch trong ngày", title: "Nắm thông tin", desc: "Bàn đặt mới, sắp xếp/trang trí bàn, món hết hàng/ngừng bán, món ưu tiên bán, chương trình khuyến mãi.", subId: "info_out_of_stock", subText: "Nắm món hết hàng/ngừng bán" },
      { id: "mid_daily_info", no: 12, phase: "CHECKLIST ĐẦU CA", shift: "CA 17H: RÀ SOÁT & HOÀN THIỆN", section: "VI. Thông tin và kế hoạch trong ngày", title: "Nắm thông tin", desc: "Bàn đặt mới, sắp xếp/trang trí bàn, món hết hàng/ngừng bán, món ưu tiên bán, chương trình khuyến mãi.", subId: "info_priority", subText: "Nắm món ưu tiên bán" },
      { id: "mid_daily_info", no: 12, phase: "CHECKLIST ĐẦU CA", shift: "CA 17H: RÀ SOÁT & HOÀN THIỆN", section: "VI. Thông tin và kế hoạch trong ngày", title: "Nắm thông tin", desc: "Bàn đặt mới, sắp xếp/trang trí bàn, món hết hàng/ngừng bán, món ưu tiên bán, chương trình khuyến mãi.", subId: "info_promo", subText: "Nắm chương trình khuyến mãi/ưu đãi" },

      { id: "mid_assignment", no: 13, phase: "CHECKLIST ĐẦU CA", shift: "CA 17H: RÀ SOÁT & HOÀN THIỆN", section: "VI. Thông tin và kế hoạch trong ngày", title: "Phân công", desc: "Điền tên vào bảng phân công vị trí trực.", subId: "assign_name", subText: "Điền tên vào bảng phân công khu trực" },
      { id: "mid_assignment", no: 13, phase: "CHECKLIST ĐẦU CA", shift: "CA 17H: RÀ SOÁT & HOÀN THIỆN", section: "VI. Thông tin và kế hoạch trong ngày", title: "Phân công", desc: "Điền tên vào bảng phân công vị trí trực.", subId: "assign_position", subText: "Nắm rõ vị trí/bàn phụ trách" },
      { id: "mid_assignment", no: 13, phase: "CHECKLIST ĐẦU CA", shift: "CA 17H: RÀ SOÁT & HOÀN THIỆN", section: "VI. Thông tin và kế hoạch trong ngày", title: "Phân công", desc: "Điền tên vào bảng phân công vị trí trực.", subId: "assign_support", subText: "Nắm nhân sự hỗ trợ khi đông khách" },

      { id: "mid_uniform", no: 14, phase: "CHECKLIST ĐẦU CA", shift: "CA 17H: RÀ SOÁT & HOÀN THIỆN", section: "VII. Sẵn sàng phục vụ", title: "Đảm bảo tác phong", desc: "Đúng đồng phục, đeo bảng tên.", subId: "uniform_ok", subText: "Đúng đồng phục" },
      { id: "mid_uniform", no: 14, phase: "CHECKLIST ĐẦU CA", shift: "CA 17H: RÀ SOÁT & HOÀN THIỆN", section: "VII. Sẵn sàng phục vụ", title: "Đảm bảo tác phong", desc: "Đúng đồng phục, đeo bảng tên.", subId: "name_tag_ok", subText: "Đeo bảng tên" },
      { id: "mid_uniform", no: 14, phase: "CHECKLIST ĐẦU CA", shift: "CA 17H: RÀ SOÁT & HOÀN THIỆN", section: "VII. Sẵn sàng phục vụ", title: "Đảm bảo tác phong", desc: "Đúng đồng phục, đeo bảng tên.", subId: "appearance_ok", subText: "Tác phong gọn gàng, lịch sự" },

      { id: "mid_service_ready", no: 15, phase: "CHECKLIST ĐẦU CA", shift: "CA 17H: RÀ SOÁT & HOÀN THIỆN", section: "VII. Sẵn sàng phục vụ", title: "Sẵn sàng phục vụ", desc: "Về đúng khu vực phân công, chuẩn bị đầy đủ để sẵn sàng phục vụ khách.", subId: "area_ready", subText: "Có mặt đúng khu vực phân công" },
      { id: "mid_service_ready", no: 15, phase: "CHECKLIST ĐẦU CA", shift: "CA 17H: RÀ SOÁT & HOÀN THIỆN", section: "VII. Sẵn sàng phục vụ", title: "Sẵn sàng phục vụ", desc: "Về đúng khu vực phân công, chuẩn bị đầy đủ để sẵn sàng phục vụ khách.", subId: "observe_ready", subText: "Quan sát khu vực, sẵn sàng hỗ trợ khách" },
      { id: "mid_service_ready", no: 15, phase: "CHECKLIST ĐẦU CA", shift: "CA 17H: RÀ SOÁT & HOÀN THIỆN", section: "VII. Sẵn sàng phục vụ", title: "Sẵn sàng phục vụ", desc: "Về đúng khu vực phân công, chuẩn bị đầy đủ để sẵn sàng phục vụ khách.", subId: "service_tools_ready", subText: "Chuẩn bị dụng cụ cần thiết để phục vụ nhanh" },

      // PHASE 3: XUỐNG CA LẦN 1
      { id: "end1_prepare_next", no: 16, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA LẦN 1", section: "VIII. Xuống ca lần 1 (21h - 22h)", title: "Thu dọn và chuẩn bị cho ca sau", desc: "Cất dọn các trạm đồ dùng dự phòng, chuẩn bị thêm các đồ dùng và sắp xếp vào tủ/khu vực chuẩn bị, lau bàn ghế khu vực trống khách.", subId: "end1_station_clear", subText: "Cất dọn trạm đồ dùng dự phòng" },
      { id: "end1_prepare_next", no: 16, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA LẦN 1", section: "VIII. Xuống ca lần 1 (21h - 22h)", title: "Thu dọn và chuẩn bị cho ca sau", desc: "Cất dọn các trạm đồ dùng dự phòng, chuẩn bị thêm các đồ dùng và sắp xếp vào tủ/khu vực chuẩn bị, lau bàn ghế khu vực trống khách.", subId: "end1_tool_prepare", subText: "Chuẩn bị thêm đồ dùng cho nhóm sau" },
      { id: "end1_prepare_next", no: 16, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA LẦN 1", section: "VIII. Xuống ca lần 1 (21h - 22h)", title: "Thu dọn và chuẩn bị cho ca sau", desc: "Cất dọn các trạm đồ dùng dự phòng, chuẩn bị thêm các đồ dùng và sắp xếp vào tủ/khu vực chuẩn bị, lau bàn ghế khu vực trống khách.", subId: "end1_table_chair", subText: "Lau bàn ghế khu vực trống khách" },
      { id: "end1_prepare_next", no: 16, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA LẦN 1", section: "VIII. Xuống ca lần 1 (21h - 22h)", title: "Thu dọn và chuẩn bị cho ca sau", desc: "Cất dọn các trạm đồ dùng dự phòng, chuẩn bị thêm các đồ dùng và sắp xếp vào tủ/khu vực chuẩn bị, lau bàn ghế khu vực trống khách.", subId: "end1_support", subText: "Hỗ trợ giảm tải cho nhóm còn lại" },

      { id: "end1_reserved_support", no: 17, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA LẦN 1", section: "VIII. Xuống ca lần 1 (21h - 22h)", title: "Hỗ trợ sắp xếp các bàn đặt trước", desc: "Ưu tiên sắp xếp các khu vực trống khách.", subId: "end1_empty_area", subText: "Ưu tiên xử lý khu vực đã trống khách" },
      { id: "end1_reserved_support", no: 17, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA LẦN 1", section: "VIII. Xuống ca lần 1 (21h - 22h)", title: "Hỗ trợ sắp xếp các bàn đặt trước", desc: "Ưu tiên sắp xếp các khu vực trống khách.", subId: "end1_next_reserved", subText: "Sắp xếp bàn đặt trước nếu có" },
      { id: "end1_reserved_support", no: 17, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA LẦN 1", section: "VIII. Xuống ca lần 1 (21h - 22h)", title: "Hỗ trợ sắp xếp các bàn đặt trước", desc: "Ưu tiên sắp xếp các khu vực trống khách.", subId: "end1_move_table", subText: "Đổi bàn/ghế đúng nhu cầu nếu cần" },

      { id: "end1_clean_empty", no: 18, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA LẦN 1", section: "VIII. Xuống ca lần 1 (21h - 22h)", title: "Vệ sinh", desc: "Quét dọn, lau gầm các bàn trống khách.", subId: "end1_sweep", subText: "Quét dọn khu vực trống khách" },
      { id: "end1_clean_empty", no: 18, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA LẦN 1", section: "VIII. Xuống ca lần 1 (21h - 22h)", title: "Vệ sinh", desc: "Quét dọn, lau gầm các bàn trống khách.", subId: "end1_under_table", subText: "Lau gầm bàn/gầm ghế" },
      { id: "end1_clean_empty", no: 18, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA LẦN 1", section: "VIII. Xuống ca lần 1 (21h - 22h)", title: "Vệ sinh", desc: "Quét dọn, lau gầm các bàn trống khách.", subId: "end1_small_trash", subText: "Thu gom rác nhỏ trong khu" },

      { id: "end1_handover_support", no: 19, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA LẦN 1", section: "VIII. Xuống ca lần 1 (21h - 22h)", title: "Hỗ trợ bàn giao", desc: "Thông tin các công việc đã xử lý, hỗ trợ kiểm tra đồ dùng.", subId: "end1_work_done", subText: "Thông tin việc đã xử lý" },
      { id: "end1_handover_support", no: 19, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA LẦN 1", section: "VIII. Xuống ca lần 1 (21h - 22h)", title: "Hỗ trợ bàn giao", desc: "Thông tin các công việc đã xử lý, hỗ trợ kiểm tra đồ dùng.", subId: "end1_tool_check", subText: "Hỗ trợ kiểm tra đồ dùng" },
      { id: "end1_handover_support", no: 19, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA LẦN 1", section: "VIII. Xuống ca lần 1 (21h - 22h)", title: "Hỗ trợ bàn giao", desc: "Thông tin các công việc đã xử lý, hỗ trợ kiểm tra đồ dùng.", subId: "end1_note_next", subText: "Ghi chú việc còn lại cho nhóm sau" },

      // PHASE 4: XUỐNG CA SAU CÙNG
      { id: "end_final_clean", no: 20, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA SAU CÙNG", section: "IX. Xuống ca sau cùng (sau 23h hoặc hết khách)", title: "Vệ sinh & Thu dọn", desc: "Vệ sinh menu, xô đá, thùng lắc/xẻ, thu dọn setup và lau mặt ghế còn lại, quét lau phần sàn nhà còn lại, thu gom rác, đổ rác, vệ sinh thùng rác, hót rác.", subId: "final_menu", subText: "Vệ sinh menu" },
      { id: "end_final_clean", no: 20, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA SAU CÙNG", section: "IX. Xuống ca sau cùng (sau 23h hoặc hết khách)", title: "Vệ sinh & Thu dọn", desc: "Vệ sinh menu, xô đá, thùng lắc/xẻ, thu dọn setup và lau mặt ghế còn lại, quét lau phần sàn nhà còn lại, thu gom rác, đổ rác, vệ sinh thùng rác, hót rác.", subId: "final_ice_bucket", subText: "Vệ sinh xô đá" },
      { id: "end_final_clean", no: 20, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA SAU CÙNG", section: "IX. Xuống ca sau cùng (sau 23h hoặc hết khách)", title: "Vệ sinh & Thu dọn", desc: "Vệ sinh menu, xô đá, thùng lắc/xẻ, thu dọn setup và lau mặt ghế còn lại, quét lau phần sàn nhà còn lại, thu gom rác, đổ rác, vệ sinh thùng rác, hót rác.", subId: "final_shaker", subText: "Vệ sinh thùng lắc/xẻ" },
      { id: "end_final_clean", no: 20, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA SAU CÙNG", section: "IX. Xuống ca sau cùng (sau 23h hoặc hết khách)", title: "Vệ sinh & Thu dọn", desc: "Vệ sinh menu, xô đá, thùng lắc/xẻ, thu dọn setup và lau mặt ghế còn lại, quét lau phần sàn nhà còn lại, thu gom rác, đổ rác, vệ sinh thùng rác, hót rác.", subId: "final_setup", subText: "Thu dọn setup và lau mặt ghế còn lại" },
      { id: "end_final_clean", no: 20, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA SAU CÙNG", section: "IX. Xuống ca sau cùng (sau 23h hoặc hết khách)", title: "Vệ sinh & Thu dọn", desc: "Vệ sinh menu, xô đá, thùng lắc/xẻ, thu dọn setup và lau mặt ghế còn lại, quét lau phần sàn nhà còn lại, thu gom rác, đổ rác, vệ sinh thùng rác, hót rác.", subId: "final_floor", subText: "Quét, lau phần sàn nhà còn lại" },
      { id: "end_final_clean", no: 20, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA SAU CÙNG", section: "IX. Xuống ca sau cùng (sau 23h hoặc hết khách)", title: "Vệ sinh & Thu dọn", desc: "Vệ sinh menu, xô đá, thùng lắc/xẻ, thu dọn setup và lau mặt ghế còn lại, quét lau phần sàn nhà còn lại, thu gom rác, đổ rác, vệ sinh thùng rác, hót rác.", subId: "final_trash", subText: "Thu gom rác, đổ rác, vệ sinh thùng rác/hót rác" },

      { id: "end_final_area_arrange", no: 21, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA SAU CÙNG", section: "IX. Xuống ca sau cùng (sau 23h hoặc hết khách)", title: "Sắp xếp khu trực", desc: "Sắp xếp các bàn đặt trước còn lại, gửi trả thiết bị về đúng vị trí, sắp xếp gọn gàng quạt, đèn, khung background.", subId: "final_reserved", subText: "Sắp xếp bàn đặt trước còn lại" },
      { id: "end_final_area_arrange", no: 21, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA SAU CÙNG", section: "IX. Xuống ca sau cùng (sau 23h hoặc hết khách)", title: "Sắp xếp khu trực", desc: "Sắp xếp các bàn đặt trước còn lại, gửi trả thiết bị về đúng vị trí, sắp xếp gọn gàng quạt, đèn, khung background.", subId: "final_return_tools", subText: "Gửi trả thiết bị về đúng vị trí" },
      { id: "end_final_area_arrange", no: 21, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA SAU CÙNG", section: "IX. Xuống ca sau cùng (sau 23h hoặc hết khách)", title: "Sắp xếp khu trực", desc: "Sắp xếp các bàn đặt trước còn lại, gửi trả thiết bị về đúng vị trí, sắp xếp gọn gàng quạt, đèn, khung background.", subId: "final_fan_light", subText: "Sắp xếp gọn quạt/đèn" },
      { id: "end_final_area_arrange", no: 21, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA SAU CÙNG", section: "IX. Xuống ca sau cùng (sau 23h hoặc hết khách)", title: "Sắp xếp khu trực", desc: "Sắp xếp các bàn đặt trước còn lại, gửi trả thiết bị về đúng vị trí, sắp xếp gọn gàng quạt, đèn, khung background.", subId: "final_background", subText: "Sắp xếp khung background/decor đúng vị trí" },

      { id: "end_final_tools", no: 22, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA SAU CÙNG", section: "IX. Xuống ca sau cùng (sau 23h hoặc hết khách)", title: "Kiểm tra thiết bị & khu vực", desc: "Kiểm tra kéo/đóng mái che, bạt che mưa, quay video/chụp ảnh khu trực, tắt thiết bị điện/đèn chiếu sáng/quạt/máy lạnh.", subId: "final_awning", subText: "Kéo/đóng mái che, bạt che mưa nếu cần" },
      { id: "end_final_tools", no: 22, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA SAU CÙNG", section: "IX. Xuống ca sau cùng (sau 23h hoặc hết khách)", title: "Kiểm tra thiết bị & khu vực", desc: "Kiểm tra kéo/đóng mái che, bạt che mưa, quay video/chụp ảnh khu trực, tắt thiết bị điện/đèn chiếu sáng/quạt/máy lạnh.", subId: "final_photo", subText: "Quay video/chụp ảnh khu trực" },
      { id: "end_final_tools", no: 22, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA SAU CÙNG", section: "IX. Xuống ca sau cùng (sau 23h hoặc hết khách)", title: "Kiểm tra thiết bị & khu vực", desc: "Kiểm tra kéo/đóng mái che, bạt che mưa, quay video/chụp ảnh khu trực, tắt thiết bị điện/đèn chiếu sáng/quạt/máy lạnh.", subId: "final_power", subText: "Tắt thiết bị điện/đèn chiếu sáng" },
      { id: "end_final_tools", no: 22, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA SAU CÙNG", section: "IX. Xuống ca sau cùng (sau 23h hoặc hết khách)", title: "Kiểm tra thiết bị & khu vực", desc: "Kiểm tra kéo/đóng mái che, bạt che mưa, quay video/chụp ảnh khu trực, tắt thiết bị điện/đèn chiếu sáng/quạt/máy lạnh.", subId: "final_fan_ac_off", subText: "Tắt quạt/máy lạnh khu vực" },

      { id: "end_final_report", no: 23, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA SAU CÙNG", section: "IX. Xuống ca sau cùng (sau 23h hoặc hết khách)", title: "Báo cáo và đóng ca", desc: "Báo cáo hư hỏng trong ca, báo cáo số lượng vật tư cần cấp cho ca sau, báo cáo số lượng đồ dùng, tắt điện khu rửa chén, tắt đèn/máy lạnh nhà vệ sinh, chấm công và ra về.", subId: "final_damage", subText: "Báo cáo hư hỏng trong ca" },
      { id: "end_final_report", no: 23, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA SAU CÙNG", section: "IX. Xuống ca sau cùng (sau 23h hoặc hết khách)", title: "Báo cáo và đóng ca", desc: "Báo cáo hư hỏng trong ca, báo cáo số lượng vật tư cần cấp cho ca sau, báo cáo số lượng đồ dùng, tắt điện khu rửa chén, tắt đèn/máy lạnh nhà vệ sinh, chấm công và ra về.", subId: "final_supply_report", subText: "Báo cáo vật tư cần cấp cho ca sau" },
      { id: "end_final_report", no: 23, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA SAU CÙNG", section: "IX. Xuống ca sau cùng (sau 23h hoặc hết khách)", title: "Báo cáo và đóng ca", desc: "Báo cáo hư hỏng trong ca, báo cáo số lượng vật tư cần cấp cho ca sau, báo cáo số lượng đồ dùng, tắt điện khu rửa chén, tắt đèn/máy lạnh nhà vệ sinh, chấm công và ra về.", subId: "final_tool_count", subText: "Báo cáo số lượng đồ dùng nếu cần" },
      { id: "end_final_report", no: 23, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA SAU CÙNG", section: "IX. Xuống ca sau cùng (sau 23h hoặc hết khách)", title: "Báo cáo và đóng ca", desc: "Báo cáo hư hỏng trong ca, báo cáo số lượng vật tư cần cấp cho ca sau, báo cáo số lượng đồ dùng, tắt điện khu rửa chén, tắt đèn/máy lạnh nhà vệ sinh, chấm công và ra về.", subId: "final_wash_area", subText: "Tắt điện khu rửa chén" },
      { id: "end_final_report", no: 23, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA SAU CÙNG", section: "IX. Xuống ca sau cùng (sau 23h hoặc hết khách)", title: "Báo cáo và đóng ca", desc: "Báo cáo hư hỏng trong ca, báo cáo số lượng vật tư cần cấp cho ca sau, báo cáo số lượng đồ dùng, tắt điện khu rửa chén, tắt đèn/máy lạnh nhà vệ sinh, chấm công và ra về.", subId: "final_wc", subText: "Tắt đèn/máy lạnh nhà vệ sinh" },
      { id: "end_final_report", no: 23, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA SAU CÙNG", section: "IX. Xuống ca sau cùng (sau 23h hoặc hết khách)", title: "Báo cáo và đóng ca", desc: "Báo cáo hư hỏng trong ca, báo cáo số lượng vật tư cần cấp cho ca sau, báo cáo số lượng đồ dùng, tắt điện khu rửa chén, tắt đèn/máy lạnh nhà vệ sinh, chấm công và ra về.", subId: "final_clock_out", subText: "Chấm công và ra về" }
    ];

    SheetService.setSheetDataFromObjects(CONFIG_SHEET, CONFIG_HEADERS, defaults);
    
    // Auto format sheet width and heights
    var ss = SheetService.getSpreadsheet();
    var configSheet = ss.getSheetByName(CONFIG_SHEET);
    configSheet.getRange(2, 2, defaults.length, 1).setHorizontalAlignment("center");
    configSheet.getRange(1, 1, defaults.length + 1, CONFIG_HEADERS.length).setVerticalAlignment("middle");
    configSheet.setColumnWidth(1, 150); // Item ID
    configSheet.setColumnWidth(2, 50);  // STT
    configSheet.setColumnWidth(3, 140); // Phase
    configSheet.setColumnWidth(4, 200); // Shift
    configSheet.setColumnWidth(5, 200); // Section
    configSheet.setColumnWidth(6, 220); // Title
    configSheet.setColumnWidth(7, 300); // Description
    configSheet.setColumnWidth(8, 140); // Sub ID
    configSheet.setColumnWidth(9, 260); // Sub Text
  }

  /**
   * Loads the structured checklist grouped by Phase, Shift, and Section.
   */
  function loadChecklistFromSheet() {
    var sheet = SheetService.getOrCreateSheet(CONFIG_SHEET, CONFIG_HEADERS);
    var lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      initDefaultChecklist();
      sheet = SheetService.getOrCreateSheet(CONFIG_SHEET, CONFIG_HEADERS);
      lastRow = sheet.getLastRow();
    }
    
    var data = SheetService.getSheetDataAsObjects(CONFIG_SHEET);
    var groupsMap = {};
    var itemsMap = {};
    
    data.forEach(function(row) {
      var itemId = row["Mã Hạng Mục"];
      if (!itemId) return;
      
      var phase = row["Phân Loại"] || "";
      var shift = row["Ca Làm Việc"] || "";
      var section = row["Phần"] || "";
      var stt = Number(row["STT"]) || 0;
      var title = row["Tiêu Đề"] || "";
      var desc = row["Mô Tả"] || "";
      var subId = row["Mã Việc Con"] || "";
      var subText = row["Nội Dung Việc Con"] || "";
      
      var groupKey = phase + "||" + shift + "||" + section;
      if (!groupsMap[groupKey]) {
        groupsMap[groupKey] = {
          phase: phase,
          shift: shift,
          section: section,
          items: []
        };
      }
      
      if (!itemsMap[itemId]) {
        itemsMap[itemId] = {
          no: stt,
          id: itemId,
          title: title,
          text: desc,
          subitems: [],
          groupKey: groupKey
        };
        groupsMap[groupKey].items.push(itemsMap[itemId]);
      }
      
      if (subId && subText) {
        itemsMap[itemId].subitems.push({
          id: subId,
          text: subText
        });
      }
    });
    
    var groups = [];
    var addedGroupKeys = {};
    
    data.forEach(function(row) {
      var itemId = row["Mã Hạng Mục"];
      if (!itemId) return;
      var phase = row["Phân Loại"] || "";
      var shift = row["Ca Làm Việc"] || "";
      var section = row["Phần"] || "";
      var groupKey = phase + "||" + shift + "||" + section;
      
      if (!addedGroupKeys[groupKey]) {
        addedGroupKeys[groupKey] = true;
        groups.push(groupsMap[groupKey]);
      }
    });
    
    groups.forEach(function(group) {
      group.items.sort(function(a, b) {
        return a.no - b.no;
      });
    });
    
    return groups;
  }

  /**
   * Loads all states saved for a given date in YYYY-MM-DD format.
   * Returns an object mapping area names to their saved states.
   */
  function getChecklistStates(dateStr) {
    var ss = SheetService.getSpreadsheet();
    var sheet = SheetService.getOrCreateSheet(STATE_SHEET, STATE_HEADERS);
    var lastRow = sheet.getLastRow();
    
    var states = {};
    if (lastRow <= 1) return states;
    
    var data = SheetService.getSheetDataAsObjects(STATE_SHEET);
    data.forEach(function(row) {
      // Safely compare date values
      var rowDateStr = row["Ngày"];
      if (rowDateStr instanceof Date) {
        rowDateStr = Utilities.formatDate(rowDateStr, "GMT+7", "yyyy-MM-dd");
      }
      
      if (rowDateStr === dateStr) {
        var area = row["Khu vực"];
        try {
          states[area] = JSON.parse(row["Dữ liệu JSON"]);
        } catch(e) {
          Logger.log("Error parsing saved JSON state: " + e.toString());
        }
      }
    });
    
    return states;
  }

  /**
   * Pre-populates a monthly report sheet with rows for all days in that month.
   */
  function prePopulateMonthlySheet(sheetName, month, year) {
    var headers = [
      "Ngày",
      "Khu A", "Đánh giá Khu A",
      "Khu B", "Đánh giá Khu B",
      "Khu C", "Đánh giá Khu C",
      "Khu D&E", "Đánh giá Khu D&E"
    ];
    
    var sheet = SheetService.getOrCreateSheet(sheetName, headers);
    
    // Only pre-populate if the sheet was just created (has only headers row)
    if (sheet.getLastRow() > 1) {
      return sheet;
    }
    
    var daysInMonth = new Date(year, month, 0).getDate();
    var values = [];
    
    for (var d = 1; d <= daysInMonth; d++) {
      var dateStr = String(d).padStart(2, "0") + "/" + String(month).padStart(2, "0") + "/" + year;
      // Date row, other cells initially empty
      values.push([dateStr, "", "", "", "", "", "", "", ""]);
    }
    
    sheet.getRange(2, 1, values.length, headers.length).setValues(values);
    
    // Formatting
    var totalRows = values.length + 1;
    sheet.getRange(2, 1, values.length, 1).setFontWeight("bold").setHorizontalAlignment("center");
    sheet.getRange(1, 1, totalRows, headers.length)
         .setVerticalAlignment("middle")
         .setBorder(true, true, true, true, true, true, "#dcdcdc", SpreadsheetApp.BorderStyle.SOLID);
         
    // Set column widths
    sheet.setColumnWidth(1, 100); // Ngày
    for (var col = 2; col <= headers.length; col++) {
      if (col % 2 === 0) {
        sheet.setColumnWidth(col, 320); // Khu A, B, C, D&E (detailed report text)
      } else {
        sheet.setColumnWidth(col, 160); // Evaluation columns
      }
    }
    
    // Freeze column A (Ngày)
    sheet.setFrozenColumns(1);
    
    return sheet;
  }

  /**
   * Formats the human readable cell content detailing the checklist progress.
   */
  function formatZoneCellText(dateStr, area, participants, items, supply, signatures, configData) {
    // 1. Gather all tasks and compute percentages
    var totalTasks = 0;
    var completedTasks = 0;
    var totalSubtasks = 0;
    var completedSubtasks = 0;
    var incompleteTaskLines = [];
    var noteLines = [];

    // Parse configuration to perform exact checking
    configData.forEach(function(group) {
      group.items.forEach(function(item) {
        totalTasks++;
        var isItemChecked = false;
        var subTotal = item.subitems.length;
        var subDone = 0;
        
        var savedItem = items[item.id] || {};
        
        if (subTotal > 0) {
          totalSubtasks += subTotal;
          var savedSubchecks = savedItem.subchecks || {};
          item.subitems.forEach(function(sub) {
            if (savedSubchecks[sub.id]) {
              completedSubtasks++;
              subDone++;
            }
          });
          isItemChecked = (subDone === subTotal);
        } else {
          isItemChecked = !!savedItem.checked;
        }

        if (isItemChecked) {
          completedTasks++;
        } else {
          var details = subTotal > 0 ? " (" + subDone + "/" + subTotal + " việc con)" : "";
          incompleteTaskLines.push(" - STT " + item.no + ": " + item.title + details);
        }

        var note = (savedItem.note || "").trim();
        if (note) {
          noteLines.push(" - STT " + item.no + ": " + note);
        }
      });
    });

    var progressPct = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
    var subProgressPct = totalSubtasks ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    // 2. Format names
    var names = participants.map(function(p) { return p.name; }).join(", ") || "(Chưa có nhân viên)";

    // 3. Format supply
    var supplyItemsMap = {
      du_dung: "Đủ dùng",
      khan_giay: "Khăn giấy",
      ong_hut: "Ống hút",
      diem: "Diêm",
      tam: "Tăm",
      xien_tre: "Xiên tre",
      bao_tay: "Bao tay",
      bao_rac: "Bao rác",
      bao_rac_den: "Bao rác đen kín",
      bao_rac_dai: "Bao rác đại",
      bao_rac_trung: "Bao rác trung",
      bao_rac_tieu: "Bao rác tiểu",
      bich_mang_ve: "Bịch mang về",
      bich_lau: "Bịch lẩu",
      bich_3kg: "Bịch 3kg",
      bich_5kg: "Bịch 5kg",
      hop_mang_ve: "Hộp mang về",
      hop_xop: "Hộp xốp",
      hop_nhua: "Hộp nhựa nắp rời"
    };

    var supplySelected = [];
    Object.keys(supply).forEach(function(key) {
      if (key !== "note" && key !== "by" && key !== "savedAt" && supply[key]) {
        supplySelected.push(supplyItemsMap[key] || key);
      }
    });

    var supplyText = "Đề xuất: " + (supplySelected.join(", ") || "Không");
    if (supply.note && supply.note.trim()) {
      supplyText += " | Ghi chú: " + supply.note.trim();
    }

    // 4. Format signatures
    var sigText = "Nhận: " + (signatures.receive || "Chưa ký") + 
                  " | Giao: " + (signatures.handover || "Chưa ký") + 
                  " | QL: " + (signatures.manager || "Chưa ký");

    // 5. Build full multiline string
    var text = "";
    text += "[👤 Nhân viên]: " + names + "\n";
    text += "[📈 Tiến độ]: " + progressPct + "% (" + completedTasks + "/" + totalTasks + " hạng mục)";
    if (totalSubtasks > 0) {
      text += " | Việc con: " + completedSubtasks + "/" + totalSubtasks + " (" + subProgressPct + "%)";
    }
    text += "\n";

    text += "[⚠️ Chưa xong]:\n" + (incompleteTaskLines.join("\n") || " - Không có") + "\n";
    text += "[📝 Ghi chú]:\n" + (noteLines.join("\n") || " - Không có") + "\n";
    text += "[📦 Vật tư]: " + supplyText + "\n";
    text += "[✍️ Bàn giao]: " + sigText + "\n";
    text += "[🕒 Cập nhật]: " + Utilities.formatDate(new Date(), "GMT+7", "HH:mm dd/MM/yyyy");

    return text;
  }

  /**
   * Saves the checklist progress for a given date and zone, updating the JSON log sheet 
   * and writing a formatted tracking summary to the monthly calendar sheet.
   */
  function saveChecklistState(dateStr, area, participants, items, supply, signatures) {
    // Robust parameter fallbacks for manual execution from the Apps Script IDE or missing parameters
    if (!dateStr) {
      dateStr = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd");
    }
    if (!area) area = "A";
    if (!participants) participants = [];
    if (!items) items = {};
    if (!supply) supply = {};
    if (!signatures) signatures = {};

    // 1. Save state to raw logs (02_LUU_TRU_TIEN_DO)
    var stateSheet = SheetService.getOrCreateSheet(STATE_SHEET, STATE_HEADERS);
    var stateRows = SheetService.getSheetDataAsObjects(STATE_SHEET);
    
    var stateObj = {
      participants: participants || [],
      items: items || {},
      supply: supply || {},
      signatures: signatures || {},
      savedAt: new Date().toISOString()
    };
    var jsonString = JSON.stringify(stateObj);
    
    var foundIndex = -1;
    for (var i = 0; i < stateRows.length; i++) {
      var rowDate = stateRows[i]["Ngày"];
      if (rowDate instanceof Date) {
        rowDate = Utilities.formatDate(rowDate, "GMT+7", "yyyy-MM-dd");
      }
      if (rowDate === dateStr && stateRows[i]["Khu vực"] === area) {
        foundIndex = i + 2; // Offset for header (1) and 0-indexing
        break;
      }
    }
    
    var timestamp = new Date().toISOString();
    var participantNames = (participants || []).map(function(p) { return p.name; }).join(", ");

    if (foundIndex !== -1) {
      // Overwrite existing row
      stateSheet.getRange(foundIndex, 3).setValue(participantNames);
      stateSheet.getRange(foundIndex, 4).setValue(jsonString);
      stateSheet.getRange(foundIndex, 5).setValue(timestamp);
    } else {
      // Append new raw row
      var newRaw = {
        "Ngày": dateStr,
        "Khu vực": area,
        "Nhân viên": participantNames,
        "Dữ liệu JSON": jsonString,
        "Thời gian cập nhật": timestamp
      };
      SheetService.appendRowFromObject(STATE_SHEET, STATE_HEADERS, newRaw);
    }
    
    // 2. Write to monthly tracking/report sheet
    // Parse Date: YYYY-MM-DD
    var parts = dateStr.split("-");
    var year = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var day = parseInt(parts[2], 10);
    
    var monthName = "Tháng " + String(month).padStart(2, "0") + "-" + year;
    
    // Auto-create and populate month calendar if newly created
    prePopulateMonthlySheet(monthName, month, year);
    
    // Load config from sheet to generate progress statistics accurately
    var configData = loadChecklistFromSheet();
    var formattedText = formatZoneCellText(dateStr, area, participants, items, supply, signatures, configData);
    
    // Write report cell in the monthly sheet (Lookup by Ngày)
    var vnDateStr = String(day).padStart(2, "0") + "/" + String(month).padStart(2, "0") + "/" + year;
    
    var headers = [
      "Ngày",
      "Khu A", "Đánh giá Khu A",
      "Khu B", "Đánh giá Khu B",
      "Khu C", "Đánh giá Khu C",
      "Khu D&E", "Đánh giá Khu D&E"
    ];
    
    var targetColHeader = "Khu " + area; // e.g., "Khu A" or "Khu D&E"
    
    SheetService.updateCellByLookup(monthName, headers, "Ngày", vnDateStr, targetColHeader, formattedText);
    
    return {
      success: true,
      monthSheet: monthName,
      date: vnDateStr,
      area: area
    };
  }

  return {
    initDefaultChecklist: initDefaultChecklist,
    loadChecklistFromSheet: loadChecklistFromSheet,
    getChecklistStates: getChecklistStates,
    saveChecklistState: saveChecklistState
  };
})();
