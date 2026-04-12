Auth và phân quyền tài khoản: đăng ký, đăng nhập, xác thực token, guard theo 5 vai trò Guest, Member, Verified NGO, Verified Individual, Admin.
Quản lý hồ sơ và trạng thái xác thực user: thông tin profile, badge xác thực, trạng thái khóa tài khoản, hiển thị quyền theo role.
Luồng duyệt Verified Individual: nộp giấy tờ minh chứng, chờ duyệt, Admin duyệt hoặc từ chối, hiển thị huy hiệu sau duyệt.
Luồng cấp hoặc thu hồi Verified NGO: Admin cấp tích xanh, thu hồi tích xanh, cập nhật quyền đăng wishlist và ưu tiên nhận đồ.
CRUD bài đăng cho tặng đồ: tạo, sửa, xóa, xem chi tiết, chỉ chủ bài được chỉnh sửa bài của mình.
Upload ảnh bài đăng: tối đa 5 ảnh, tối ưu dung lượng ảnh khi upload, lưu và hiển thị gallery ảnh.
Quản lý trạng thái bài đăng theo vòng đời: Sẵn sàng → Đang giao dịch → Đã giao dịch → Hoàn thành, kèm rule ai được chuyển từng bước.
Đăng ký nhận đồ: Verified NGO hoặc Verified Individual gửi mô tả hoàn cảnh trên bài ở trạng thái Sẵn sàng.
Danh sách ứng viên nhận đồ và ưu tiên hiển thị: ưu tiên NGO xác thực, sau đó cá nhân khó khăn, rồi member thường.
Chọn người nhận và xử lý kết quả: người đăng chọn 1 người nhận, hệ thống gửi thông báo cho người được chọn và không được chọn, tự chuyển bài sang Đang giao dịch.
Giới hạn nhận theo tháng: Verified Individual tối đa 3, NGO tối đa 10, ẩn nút đăng ký khi chạm limit và reset theo tháng.
Hệ thống chat 1-1 real-time: chỉ mở chat sau khi được chọn nhận đồ, tự tạo hội thoại nếu chưa có, tái sử dụng hội thoại cho các lần sau.
Thread feedback xác nhận nhận đồ: người nhận đăng ảnh xác nhận sau giao nhận, làm bằng chứng để Admin set Hoàn thành.
Leaderboard tháng và gamification: tính điểm từ bài Hoàn thành, top 10 real-time, huy hiệu top 1, top 2-5, top 6-10, reset theo tháng.
Trang wishlist cho NGO: chỉ NGO xác thực được đăng wishlist, người dùng khác xem và liên hệ tặng, Admin có thể ghim wishlist khẩn cấp.
Search và filter diễn đàn: full-text search, filter category, filter status cho Admin, hỗ trợ location mặc định Hà Nội.
Hệ thống profile theo vai trò: profile người tặng, profile cá nhân khó khăn với lịch sử nhận và ảnh cảm ơn, profile NGO với wishlist và thông tin xác thực.
Admin dashboard tổng hợp: duyệt tài khoản, cấp tích xanh NGO, khóa user, xóa bài vi phạm, ghim bài, set Hoàn thành, quản lý leaderboard.
Audit log và history logs: lưu lịch sử giao dịch và thao tác quản trị để truy xuất khi có khiếu nại.
Module Bản tin cộng đồng (News/Blog): Admin tạo, sửa, xóa, ẩn bài; trạng thái Draft, Published, Hidden; hỗ trợ ghim bài.
Trang public news: danh sách bài Published, ưu tiên bài ghim, lọc theo category, trang chi tiết bài, không có comment.
Tích hợp news lên trang chủ: section 3 bài mới nhất và nút xem tất cả.
Bộ trang giao diện chính: trang chủ, posts, post detail, wishlist, leaderboard, profile, chat, admin, news list, news detail.
Notification hệ thống: thông báo chọn hoặc trượt nhận đồ, các trạng thái quan trọng trong flow giao dịch.