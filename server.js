const express = require("express");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const fs = require("fs");
const app = express();
const port = 3000;
const cors = require("cors");
const { stdin } = require("process");
app.use(cors());
app.use(bodyParser.text());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/run", (req, res) => {
  const cppCode = req.body;
  const inputText = fs.readFileSync("./input.txt", "utf8");
  const outputText = fs.readFileSync("./output.txt", "utf8");
  const inputLines = inputText.trim().split("\n");
  const outputLines = outputText.trim().split("\n");
  try {
    fs.writeFileSync("code.cpp", cppCode);
    console.log("Mã C++ đã được lưu vào code.cpp");
  } catch (error) {
    console.error("Lỗi khi lưu mã C++ vào code.cpp:", error);
  }
  let i = 0;
  let isCorrect = 0;
  // Hàm chạy chương trình C++ và so sánh kết quả
  function runCodeWithInput(input) {
    const uniqueCodeFileName = "code.exe";

    exec(
      `g++ code.cpp -o ${uniqueCodeFileName} && echo ${input} | ${uniqueCodeFileName}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          res.send(`exec error: ${error}`);
          return;
        }
        const output = stdout.trim();
        console.log("Input:", input);
        console.log("Output:", output.trim());
        console.log("Expected Output:", outputLines[i].trim());
        if (output.trim() === outputLines[i].trim()) {
          console.log("Kết quả đúng!");
          isCorrect++;
        } else {
          console.log("Kết quả sai!");
          // kq.innerText += "Kế quả sai\n";
        }

        i++; // Tăng biến đếm sau mỗi lần xử lý

        // Nếu đã xử lý hết tất cả các dòng đầu vào thì gửi phản hồi về máy khách
        if (i === inputLines.length) {
          if (isCorrect === inputLines.length) {
            res.send("Kết quả đúng!");
          } else {
            res.send(`Kết quả sai. Bạn đúng ${isCorrect}/${inputLines.length}`);
          }
        } else {
          // Nếu chưa xử lý xong, tiếp tục chạy với dòng đầu vào tiếp theo
          runCodeWithInput(inputLines[i]);
        }
      }
    );
  }

  // Bắt đầu chạy chương trình C++ với dòng đầu vào đầu tiên
  runCodeWithInput(inputLines[i]);
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
