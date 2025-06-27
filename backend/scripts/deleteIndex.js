// scripts/deleteIndex.js

require('dotenv').config({ path: '.env' });

const { MeiliSearch } = require('meilisearch');

// Tên index bạn muốn xóa
const INDEX_TO_DELETE = 'products';

const client = new MeiliSearch({
    host: process.env.MEILI_HOST,
    apiKey: process.env.MEILI_MASTER_KEY,
});

const deleteIndex = async () => {
    try {
        console.log(`Đang yêu cầu xóa index: "${INDEX_TO_DELETE}"...`);

        // Gửi yêu cầu xóa index
        const task = await client.deleteIndex(INDEX_TO_DELETE);

        console.log('Đã gửi yêu cầu xóa thành công. Dưới đây là thông tin tác vụ:');
        console.log(task);

        // // (Tùy chọn) Chờ cho tác vụ hoàn tất
        // console.log('Đang chờ tác vụ xóa hoàn tất...');
        // await client.waitForTask(task.taskUid);
        // console.log(`Index "${INDEX_TO_DELETE}" đã được xóa thành công!`);

    } catch (error) {
        // Meilisearch sẽ báo lỗi nếu index không tồn tại
        if (error.code === 'index_not_found') {
            console.warn(`Index "${INDEX_TO_DELETE}" không tồn tại. Không có gì để xóa.`);
        } else {
            console.error(`Xóa index thất bại:`, error.message);
        }
    }
};

deleteIndex();