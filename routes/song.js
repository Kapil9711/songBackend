import { Router } from "express";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import secret from "../config/secret.js";
import axios from "axios";
import myCache from "../config/nodeCache.js";
const router = Router();

// get formated home-page data => song/home-page
router.route("/home-page").get(
  catchAsyncError(async (req, res, next) => {
    const haryanviViralPlaylistId = "171187849";
    const punjabiHitsPlaylistId = "1134543511";
    const hindiHitsPlaylistId = "1134543272";
    let haryanviUrl = `${secret.JIO_BASE_URL}/playlists?id=${haryanviViralPlaylistId}&&limit=100`;
    let hindiUrl = `${secret.JIO_BASE_URL}/playlists?id=${hindiHitsPlaylistId}&&limit=100`;
    let punjabiUrl = `${secret.JIO_BASE_URL}/playlists?id=${punjabiHitsPlaylistId}&&limit=100`;
    const haryavniPromise = axios.get(haryanviUrl);
    const hindiPromise = axios.get(hindiUrl);
    const punjabiPromise = axios.get(punjabiUrl);

    try {
      const cacheData = myCache.get("trendings");
      if (cacheData) {
        const { haryanvi, punjabi, hindi } = JSON.parse(cacheData);
        return res.status(200).json({
          success: true,
          message: "Home page Data",
          hindi,
          haryanvi,
          punjabi,
        });
      }
    } catch (error) {
      console.log(error);
    }

    const [haryanviData, hindiData, punjabiData] = await Promise.allSettled([
      haryavniPromise,
      hindiPromise,
      punjabiPromise,
    ]);

    let hindi = [],
      punjabi = [],
      haryanvi = [];
    if (haryanviData.status === "fulfilled") {
      const songs = haryanviData.value.data.data.songs;
      haryanvi = songs;
    }
    if (hindiData.status === "fulfilled") {
      const songs = hindiData.value.data.data.songs;
      hindi = songs;
    }
    if (punjabiData.status === "fulfilled") {
      const songs = punjabiData.value.data.data.songs;
      punjabi = songs;
    }

    let trendings = { haryanvi, hindi, punjabi };
    try {
      myCache.set("trendings", JSON.stringify(trendings));
    } catch (error) {
      console.log("error", error);
    }

    res.status(200).json({
      success: true,
      message: "Home page Data",
      hindi,
      haryanvi,
      punjabi,
    });
  })
);

export default router;
