const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/download', async (req, res) => {
  const { url, quality = '1080', format = 'video' } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'يرجى تزويد رابط الوسائط' });
  }

  try {
    const allowedQualities = ['1080', '720', '480', '360'];
    const selectedQuality = allowedQualities.includes(String(quality)) ? String(quality) : '1080';
    const formatSelector = format === 'audio'
      ? 'bestaudio[ext=m4a]/bestaudio/best'
      : `best[height<=${selectedQuality}][ext=mp4]/best[height<=${selectedQuality}]/best`;

    const output = await youtubedl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      format: formatSelector,
      addHeader: [
        'referer:youtube.com',
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });

    const directUrl = output?.url || output?.requested_formats?.find((item) => item.url)?.url ||
      output?.formats?.slice().reverse().find((item) => item.url && item.vcodec !== 'none')?.url;

    if (directUrl) {
      return res.json({
        title: output.title || 'Media Download',
        url: directUrl,
        thumbnail: output.thumbnail,
        ext: format === 'audio' ? 'm4a' : output.ext || 'mp4'
      });
    }

    throw new Error('لم يتم العثور على رابط مباشر');
  } catch (error) {
    console.error(error);
    const details = `${error.stderr || ''} ${error.message || ''}`.toLowerCase();
    if (details.includes('video is unavailable') || details.includes('private video') || details.includes('sign in')) {
      return res.status(422).json({ error: 'الفيديو غير متاح للعامة أو يتطلب تسجيل الدخول.' });
    }
    res.status(500).json({ error: 'تعذر استخراج الوسائط من الرابط' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
