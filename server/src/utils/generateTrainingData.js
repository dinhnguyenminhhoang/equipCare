const { Brand } = require("../models/brand.model");
const { Category } = require("../models/category.model");
const { Product } = require("../models/product.model");
const { Review } = require("../models/review.model");
const fs = require("fs");

async function generateTrainingData() {
  try {
    const products = await Product.find().populate("brand category reviews");
    const categories = await Category.find()
      .populate({
        path: "products",
        select: "title",
      })
      .lean();
    const brands = await Brand.find()
      .populate({
        path: "products",
        select: "title",
      })
      .lean();
    const reviews = await Review.find();

    let trainingData = [];

    // Tạo câu training từ sản phẩm
    products.forEach((product) => {
      // Câu hỏi về giá
      trainingData.push({
        messages: [
          {
            role: "user",
            content: `Sản phẩm ${product.title} có giá bao nhiêu?`,
          },
          {
            role: "assistant",
            content: `Giá của ${product.title} là ${product.price} VNĐ.`,
          },
        ],
      });

      // Câu hỏi về thương hiệu
      trainingData.push({
        messages: [
          {
            role: "user",
            content: `Sản phẩm ${product.title} thuộc thương hiệu nào?`,
          },
          {
            role: "assistant",
            content: `Sản phẩm ${product.title} thuộc thương hiệu ${
              product.brand?.name || "Không xác định"
            }.`,
          },
        ],
      });

      // Câu hỏi về danh mục
      trainingData.push({
        messages: [
          {
            role: "user",
            content: `Sản phẩm ${product.title} thuộc danh mục nào?`,
          },
          {
            role: "assistant",
            content: `Sản phẩm ${product.title} thuộc danh mục ${
              product.category?.name || "Không xác định"
            }.`,
          },
        ],
      });

      // Câu hỏi về mô tả
      trainingData.push({
        messages: [
          { role: "user", content: `Mô tả sản phẩm ${product.title} là gì?` },
          {
            role: "assistant",
            content: `Mô tả sản phẩm ${product.title}: ${product.description}`,
          },
        ],
      });

      // Câu hỏi về số lượng
      trainingData.push({
        messages: [
          {
            role: "user",
            content: `Sản phẩm ${product.title} còn bao nhiêu cái?`,
          },
          {
            role: "assistant",
            content: `Sản phẩm ${product.title} hiện có ${product.quantity} cái trong kho.`,
          },
        ],
      });

      // Câu hỏi về trạng thái
      trainingData.push({
        messages: [
          {
            role: "user",
            content: `Sản phẩm ${product.title} có còn hàng không?`,
          },
          {
            role: "assistant",
            content: `Sản phẩm ${product.title} hiện đang ${
              product.status === "in-stock" ? "còn hàng" : "hết hàng"
            }.`,
          },
        ],
      });

      // Câu hỏi về kích thước
      product.sizes.forEach((size) => {
        trainingData.push({
          messages: [
            {
              role: "user",
              content: `Sản phẩm ${product.title} có size ${size.size} không?`,
            },
            {
              role: "assistant",
              content: `Sản phẩm ${product.title} có size ${size.size} với giá ${size.originPrice} VNĐ và còn ${size.quantity} cái trong kho.`,
            },
          ],
        });
      });
    });

    // Tạo câu training từ danh mục
    categories.forEach((category) => {
      // Câu hỏi về sản phẩm trong danh mục
      trainingData.push({
        messages: [
          {
            role: "user",
            content: `Danh mục ${category.name} có những sản phẩm nào?`,
          },
          {
            role: "assistant",
            content: `Danh mục ${category.name} có các sản phẩm như: ${
              category.products.length
                ? category.products.map((p) => p.title).join(", ")
                : "Chưa có sản phẩm nào"
            }.`,
          },
        ],
      });

      // Câu hỏi về mô tả danh mục
      trainingData.push({
        messages: [
          { role: "user", content: `Mô tả danh mục ${category.name} là gì?` },
          {
            role: "assistant",
            content: `Mô tả danh mục ${category.name}: ${
              category.description || "Không có mô tả"
            }.`,
          },
        ],
      });

      // Câu hỏi về trạng thái danh mục
      trainingData.push({
        messages: [
          {
            role: "user",
            content: `Danh mục ${category.name} có đang hoạt động không?`,
          },
          {
            role: "assistant",
            content: `Danh mục ${category.name} hiện đang ${
              category.status === "active" ? "hoạt động" : "không hoạt động"
            }.`,
          },
        ],
      });
    });
    brands.forEach((brand) => {
      // Câu hỏi về sản phẩm của thương hiệu
      trainingData.push({
        messages: [
          {
            role: "user",
            content: `Thương hiệu ${brand.name} có những sản phẩm nào?`,
          },
          {
            role: "assistant",
            content: `Thương hiệu ${brand.name} có các sản phẩm như: ${
              brand.products?.length
                ? brand.products.map((p) => p.title).join(", ")
                : "Chưa có sản phẩm nào"
            }.`,
          },
        ],
      });

      // Câu hỏi về địa chỉ thương hiệu
      trainingData.push({
        messages: [
          {
            role: "user",
            content: `Địa chỉ của thương hiệu ${brand.name} ở đâu?`,
          },
          {
            role: "assistant",
            content: `Địa chỉ của thương hiệu ${brand.name} là ${brand.address}.`,
          },
        ],
      });

      // Câu hỏi về mô tả thương hiệu
      trainingData.push({
        messages: [
          { role: "user", content: `Mô tả thương hiệu ${brand.name} là gì?` },
          {
            role: "assistant",
            content: `Mô tả thương hiệu ${brand.name}: ${
              brand.description || "Không có mô tả"
            }.`,
          },
        ],
      });

      // Câu hỏi về trạng thái thương hiệu
      trainingData.push({
        messages: [
          {
            role: "user",
            content: `Thương hiệu ${brand.name} có đang hoạt động không?`,
          },
          {
            role: "assistant",
            content: `Thương hiệu ${brand.name} hiện đang ${
              brand.status === "active" ? "hoạt động" : "không hoạt động"
            }.`,
          },
        ],
      });
    });
    // Tạo câu training từ đánh giá
    reviews.forEach((review) => {
      // Câu hỏi về đánh giá sản phẩm
      trainingData.push({
        messages: [
          { role: "user", content: `Sản phẩm này có đánh giá không?` },
          {
            role: "assistant",
            content: `Sản phẩm có đánh giá ${review.rating}/5 với nhận xét: ${
              review.comment || "Không có bình luận"
            }.`,
          },
        ],
      });

      // Câu hỏi về bình luận cụ thể
      if (review.comment) {
        trainingData.push({
          messages: [
            {
              role: "user",
              content: `Có bình luận nào về sản phẩm này không?`,
            },
            {
              role: "assistant",
              content: `Có một bình luận về sản phẩm này: "${review.comment}".`,
            },
          ],
        });
      }
    });

    // Ghi vào file JSONL
    const jsonlData = trainingData
      .map((item) => JSON.stringify(item))
      .join("\n");
    fs.writeFileSync("dataTraining.jsonl", jsonlData, "utf8");

    console.log("✅ Training data đã được tạo và lưu vào dataTraining.jsonl");
    return "traning thanh cong";
  } catch (error) {
    console.error("❌ Lỗi khi tạo training data:", error);
  }
}
module.exports = { generateTrainingData };
