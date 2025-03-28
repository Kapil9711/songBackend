import { Router } from "express";
import { isAuthenticatedUser } from "../middlewares/auth.js";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import CustomError from "../utils/customError.js";
import Playlist from "../models/playlist.js";
import { isValidObjectId } from "mongoose";
const router = Router();

router.route("/").get(
  isAuthenticatedUser,
  catchAsyncError(async (req, res, next) => {
    if (!req.user)
      return next(new CustomError(400, "User is not Authenticated"));
    const userId = req.user.id;
    const playlists = await Playlist.find({ userId: userId }, "name id image");

    return res.status(200).json({ isSuccess: true, playlists });
  })
);

router.route("/").post(
  isAuthenticatedUser,
  catchAsyncError(async (req, res, next) => {
    const { name, id, image, songs } = req.body;
    const userId = req.user.id;

    if (!req.user)
      return next(new CustomError(400, "User is not Authenticated"));

    const newPlaylist = await Playlist.create({
      name,
      id,
      image,
      songs: Array.isArray(songs) ? songs : [],
      userId,
    });

    if (!newPlaylist)
      return next(new CustomError(500, "Internat server error"));

    return res.status(200).json({ isSuccess: true, playlist: newPlaylist });
  })
);
router.route("/").delete(
  isAuthenticatedUser,
  catchAsyncError(async (req, res, next) => {
    const { id } = req.body;
    const userId = req.user.id;
    if (!req.user)
      return next(new CustomError(400, "User is not Authenticated"));

    if (!isValidObjectId(id))
      return next(new CustomError(400, "Valid Playlistid is required"));

    await Playlist.deleteOne({ userId, _id: id });

    return res
      .status(200)
      .json({ isSuccess: true, message: "Playlist Deleted Successfully" });
  })
);

router.route("/song").put(
  isAuthenticatedUser,
  catchAsyncError(async (req, res, next) => {
    if (!req.user) return next(new CustomError(404, "user not found"));
    const { id, song } = req.body;
    if (!song) return next(new CustomError(400), "Song is Required");
    if (!isValidObjectId(id))
      return next(new CustomError(400, "Valid Playlistid is required"));
    const userId = req.user?.id;
    const isExist = await Playlist.findOne({ _id: id, userId });
    if (!isExist)
      return next(
        new CustomError({ isSuccess: false, message: "Playlist not Exist" })
      );
    const songExist = isExist.songs.some((item) => item.id === song.id);
    if (!songExist) {
      isExist.songs.push(song);
      await isExist.save();
    }
    return res.status(200).json({ isSuccess: true, playlist: isExist });
  })
);

router.route("/song").delete(
  isAuthenticatedUser,
  catchAsyncError(async (req, res, next) => {
    if (!req.user) return next(new CustomError(404, "user not found"));
    const { id, songId } = req.body;
    if (!isValidObjectId(id))
      return next(new CustomError(400, "Valid Playlistid is required"));
    if (!songId || !id)
      return next(new CustomError(400), "SongId and PlaylistId is Required");

    const userId = req.user?.id;
    const isExist = await Playlist.findOne({ _id: id, userId });
    if (!isExist)
      return next(
        new CustomError({ isSuccess: false, message: "Playlist not Exist" })
      );
    isExist.songs = isExist.songs.filter((item) => item._id != songId);
    await isExist.save();
    return res.status(200).json({ isSuccess: true, playlist: isExist });
  })
);

router.route("/song").get(
  isAuthenticatedUser,
  catchAsyncError(async (req, res, next) => {
    if (!req.user)
      return next(new CustomError(400, "User is not Authenticated"));
    const userId = req.user.id;
    const { id } = req.query;
    if (!isValidObjectId(id))
      return next(new CustomError(400, "Provide A Valid PlaylistId"));
    const songs = await Playlist.find({ userId: userId, _id: id }, "songs");

    return res.status(200).json({ isSuccess: true, songs });
  })
);

export default router;
