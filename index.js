const puppeteer = require('puppeteer');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('What images you want to see? You should try something like: "cats": ', ((answer) => {

  const subject = answer;

  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://unsplash.com/s/photos/${subject}`);

    const imgList = await page.evaluate(() => {
      // get all images
      const nodeList = document.querySelectorAll('figure img');

      // change nodeList to array
      const imgArray = [...nodeList];

      // change array into js objects
      const imgList = imgArray.map(({ src, alt }) => ({
        src,
        alt,
      }));

      return imgList;
    });

    //save data in local file
    try {
      const rawImagesInfo = fs.readFileSync('images.json', null, (err) => {
        if (err) throw new Error('something went wrong');
      });

      const currentImagesJSON = JSON.parse(rawImagesInfo);

      const images = {
        ...currentImagesJSON,
        [subject]: imgList,
      }

      fs.writeFile('images.json', JSON.stringify(images, null, 2), (err) => {
        if (err) throw new Error('something went wrong');

        console.log('nice!');
      });
    } catch (err) {
      if (err) throw new Error('something went wrong');
    }

    await browser.close();
  })();

  rl.close();
}));