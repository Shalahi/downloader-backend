const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/download', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'يرجى تزويد رابط الوسائط' });
  }

  try {
    const output = await youtubedl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: [
        'referer:youtube.com',
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });

    if (output && output.url) {
      return res.json({
        title: output.title,
        url: output.url,
        thumbnail: output.thumbnail,
        ext: output.ext || 'mp4'
      });
    }

    throw new Error('لم يتم العثور على رابط مباشر');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'تعذر استخراج الوسائط من الرابط' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
