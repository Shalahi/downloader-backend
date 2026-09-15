const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/download', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'يرجى تزويد رابط الفيديو' });
  }

  try {
    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });

    res.json({
      title: info.videoDetails.title,
      url: format.url,
      thumbnail: info.videoDetails.thumbnails[0]?.url || '',
      ext: 'mp4'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'تعذر استخراج رابط الفيديو، تأكد من صحة الرابط' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
