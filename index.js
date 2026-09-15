const express = require('express');
const cors = require('cors');
const { exec } = require('yt-dlp-exec');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/download', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'يرجى تزويد رابط الفيديو' });
  }

  try {
    // استخراج معلومات الفيديو ورابط التحميل المباشر
    const output = await exec(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      format: 'best',
    });

    res.json({
      title: output.title,
      url: output.url,
      thumbnail: output.thumbnail,
      ext: output.ext
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'تعذر استخراج رابط الفيديو' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});