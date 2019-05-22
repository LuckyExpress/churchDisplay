"use strict";

const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs"); // using file system module
const reload = require("reload");
const watch = require("node-watch");
const sse = require("server-sent-events");
const path = require("path");
const chokidar = require("chokidar");

// const folderUpperLeft = path.resolve(__dirname, "public/upperLeft");
// const folderLowerLeft = path.resolve(__dirname, "public/lowerLeft");
// const folderRight = path.resolve(__dirname, "public/right");
const dataPath = "/docker/churchDisplay/";
const folderUpperLeft = dataPath + "upperLeft";
const folderLowerLeft = dataPath + "lowerLeft";
const folderRight = dataPath + "right";

app.use(express.static(dataPath));
app.use(express.static(path.resolve(__dirname, "public")));

app.get("/", (req, res) => {
	res.sendFile(path.resolve(__dirname, "index.html"));
});

app.get("/dir", (req, res) => {
	fs.readdir(folderUpperLeft, (err, files) => {
		if (files) {
			// handle synology's self-created thumbnail directory (120122)
			var index = files.indexOf("@eaDir");
			if (index > -1) files.splice(index, 1);
			res.send(files);
		}
	});
});

app.get("/dir2", (req, res) => {
	fs.readdir(folderLowerLeft, (err, files) => {
		if (files) {
			var index = files.indexOf("@eaDir");
			if (index > -1) files.splice(index, 1);
			res.send(files);
		}
	});
});

app.get("/dir3", (req, res) => {
	fs.readdir(folderRight, (err, files) => {
		if (files) {
			var index = files.indexOf("@eaDir");
			if (index > -1) files.splice(index, 1);
			res.send(files);
		}
	});
});

// app.get('/p/:tagId', function (req, res) {
// 	res.send("tagId is set to " + req.params.tagId);
// });

const myWatch = (folder, sse, res) => {
	chokidar.watch(folder, { usePolling: true, interval: 1000, binaryInterval: 1000, ignoreInitial: true }).on("all", (event, path) => {
		let newFile = null;
		if (event === "add") newFile = path.replace(/^.*[\\\/]/, "");
		fs.readdir(folder, (err, files) => {
			if (files) {
				// handle synology's self-created thumbnail directory (120122)
				var index = files.indexOf("@eaDir");
				if (index > -1) files.splice(index, 1);

				// now get the default index (190522)
				index = -1;
				if (newFile) index = files.indexOf(newFile);

				let myObj = { index: index, files: files };
				let myJson = JSON.stringify(myObj);
				res.sse(`data: ${myJson}\n\n`);
			}
		});
	});
};

app.get("/event1", sse, (req, res) => {
	myWatch(folderUpperLeft, sse, res);
});

app.get("/event2", sse, (req, res) => {
	myWatch(folderLowerLeft, sse, res);
});

app.get("/event3", sse, (req, res) => {
	myWatch(folderRight, sse, res);
});

// reload page when restart node (default port 9856) (180125)
app.use("/reload", express.static(path.resolve(__dirname, "node_modules")));
reload(app, { port: 9857 });

app.use((req, res) => {
	res.statusCode = 404;
	res.end("404!");
});

const port = 3000;

app.listen(port, () => {
	console.log(`Church Display - listening on port ${port}!`);
});
