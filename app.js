const express =require("express");
const app =express();
app.use(express.json());

const { open } =require("sqlite");
const sqlite3 =require("sqlite3");

const path =require("path");
const dbPath =require.join(__dirname, "cricketMatchDetails.db");

let db = null;

const intializerDbAndServer = async() => {
    try {
       db =await open ({
        filename :dbPath,
        driver : sqlite3.Database,
       });

       app.listen(3000, () =>{
        console.log("Server Running at https://localhost:3000/");
       });
    } catch (error){
        console.log(error.message);
    }
};

intializerDbAndServer();

//get players API-1
app.get("/players/" , async (request ,response) =>{
   const { playerId } =request.params;
   const getPlayerQuery = `
   SELECT 
    player_id AS playerId,
    player_name AS playerName;
   FROM 
    player_details
   WHERE
    player_id =${playerId}`;

 const playerArray =await db.get(getPlayerQuery);
 response.send(playerArray);
});

//get players API-2
app.get("/players/:playerId/" , async (request ,response) =>{
   const { playerId } =request.params;
   const getPlayerQuery = `
   SELECT 
    player_id AS playerId,
    player_name AS playerName;
   FROM 
    player_details
   WHERE
    player_id =${playerId}`;

 const player =await db.get(getPlayerQuery);
 response.send(player);
});

//put API-3 
app.put("/players/:playerId/", async (request,response) =>{
    const { playerId } = request.params;
    const playerDeatils = request.body;
    const { playerName } = playerDeatils;

    const playerDetailsQuery =`
    UPDATE
      player_details
    SET
      player_name ='${playerName}'
    WHERE
      player_id =${playerId}
    ;`;

await db.run(playerDetailsQuery);
response.send("Player Details Updated");
});

//get matches API-4
app.get("/matches/:matchId/", async (request,response) =>{
    const { matchId } =request.params;
    const getmatchQuery =`
    SELECT
      match_id AS matchId,
      match,
      years
    FROM 
      player_details
    WHERE
      match_id =${matchId}
    ;`;

const matchArray = await db.get(getmatchQuery);
response.send(matchArray);
});

//get players mathces API-5
app.get("/players/:playerId/matches", async (request,response) =>{
    const { playerId } = request.params;
    const getPlayerMatchesQuery =`
    SELECT
     match_id AS matchId,
     match,
     years
    FROM
     player_match_score NATURAL JOIN match_details
    WHERE
     player_id =${playerId}
    ;`;

const playerMatchArray = await db.all(getPlayerMatchesQuery);
response.send(playerMatchArray); 
});


//get match player API-6
app.get("/matches/:matchId/players", async (request,response) =>{
    const { matchId } =request.params;
    const getMatchPlayersQuery =`
    SELECT 
      player_match_score.player_id AS playerId,
      player_name AS playerName
    FROM
      player_details INNER JOIN player_match_score ON player_details.player_id =player_match_score.player_id
    WHERE
      match_id =${matchId}
    ;`;

const matchArray =await db.all(getMatchPlayersQuery);
response.send(matchArray);
});

//get player score API-7
app.get("/players/:playerId/playerScores", async (request,response) =>{
    const { playerId } =request.params;
    const getPlayerScoreQuery =`
    SELECT
      player_details.player_id AS playerId,
      player_details.player_name AS playerName,
      SUM(player_match_score.score) AS totalScore,
      SUM(player_match_score.fours) AS totalFours,
      SUM(player_match_score.sixes) AS totalSixes
    FROM
      player_details INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id
    WHERE
      player_details.player_id =${playerId}
    ;`;

const playerScoreArray = await db.get(getPlayerScoreQuery);
response.send(playerScoreArray);
});

module.exports =app;