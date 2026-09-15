const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/download', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'يرجى تزويد رابط الوسائط' });
  }

  try {
    const apiUrl = `https://api.vreden.my.id/api/download/allinone?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data && data.result) {
      const media = data.result;
      const mediaUrl = media.url || media.video || media.audio || media.download?.url;

      if (!mediaUrl) {
        throw new Error('لم يتم العثور على رابط تنزيل');
      }

      return res.json({
        title: media.title || 'Media Download',
        url: mediaUrl,
        thumbnail: media.thumbnail || '',
        ext: 'mp4'
      });
    }

    throw new Error('فشل الاستخراج');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'تعذر استخراج الوسائط من الرابط' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
