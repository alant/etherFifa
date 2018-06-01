pragma solidity ^0.4.21;

import "./DateTime.sol";
import "./Ownable.sol";

contract FifaWorldCup is DateTime, Ownable{
  using SafeMath for uint256;
  modifier onlyNotFinished(uint16 _gameId) {
    require(canVote(_gameId));
    _;
  }
  struct Vote {
    uint256 deposit;
    uint8 vote;
  }
  struct Game {
    string name;
    uint startTime;
    uint32 voteCount; 
    uint256 win;
    uint256 draw;
    uint256 lose;
    uint8 result;
    mapping(address => Vote) votes;
  }

  mapping (uint16 => Game) games;
  uint16 gameCount;
  uint delay = 1800;

  constructor() public {
    // matchDay = 1528988400;
  }
  function setDelay(uint _delay) public onlyOwner {
    delay = _delay;
  }
  function canVote(uint16 _gameId) public view returns (bool) {
    //add 15 mins to the startTime
    return now < (games[_gameId].startTime + delay);
  }
  
  function getGameCount() public view returns (uint16) {
    return gameCount;
  }
  function getName(uint16 _gameId) public view returns (string) {
    return games[_gameId].name;
  }
  function getStartTime(uint16 _gameId) public view returns (uint) {
    return games[_gameId].startTime;
  }
  function setStartTime(uint16 _gameId, uint _startTime) public onlyOwner {
    games[_gameId].startTime = _startTime;
  }
  function getWinVote(uint16 _gameId) public view returns (uint) {
    return games[_gameId].win;
  }
  function getDrawVote(uint16 _gameId) public view returns (uint) {
    return games[_gameId].draw;
  }
  function getLoseVote(uint16 _gameId) public view returns (uint) {
    return games[_gameId].lose;
  }
  function setResult(uint16 _gameId, uint8 _result) public onlyOwner {
    games[_gameId].result = _result;
  }

  function addGame(string _name, uint _startTime) public onlyOwner {
    games[gameCount].name = _name;
    games[gameCount].startTime = _startTime;
    gameCount++;
  }

  function castVote(uint16 _gameId, uint8 _direction) public payable onlyNotFinished(0) {
    require(_direction > 0 && _direction < 4);
    Game storage game = games[_gameId];
    Vote storage myVote = game.votes[msg.sender];
    require(myVote.vote == 0 || myVote.vote == _direction);
    myVote.deposit += msg.value;
    if (myVote.vote == 0) {
      myVote.vote = _direction;
    }
    if (_direction == 1) {
      games[_gameId].win += msg.value;
    } else if (_direction == 2) {
      games[_gameId].draw += msg.value;
    } else if (_direction == 3) {
      games[_gameId].lose += msg.value;
    }
    games[_gameId].voteCount++;
  }
  function getWinning(uint16 _gameId, address _voter) view public returns (uint256) {
    uint256 winning;
    Game storage game = games[_gameId];
    Vote storage myVote = game.votes[_voter];
    if (game.result != myVote.vote) {
      return 0;
    } 
    
    uint256 pot;
    if (myVote.vote == 1) {
      pot = pot.add(game.draw);
      pot = pot.add(game.lose);
      winning = pot.mul(myVote.deposit.div(game.win));
    } else if (myVote.vote == 2) {
      pot = pot.add(game.win);
      pot = pot.add(game.lose);
      winning = pot.mul(myVote.deposit.div(game.draw));
    } else if (myVote.vote == 3) {
      pot = pot.add(game.win);
      pot = pot.add(game.draw);
      winning = pot.mul(myVote.deposit.div(game.lose));
    }
    return winning.add(myVote.deposit);
  }

  function withdraw(uint16 _gameId) public {
    Game storage game = games[_gameId];
    Vote storage myVote = game.votes[msg.sender];
    require(game.result == myVote.vote);
    msg.sender.transfer(getWinning(_gameId, msg.sender));
  }
  // function getGameYear() view public returns (uint16){
  //     return getYear(matchDay);
  // }
  // function getGameMonth() view public returns (uint8){
  //     return getMonth(matchDay);
  // }
  // function getGameDay() view public returns (uint8){
  //     return getDay(matchDay);
  // }
  // function getGameHour() view public returns (uint8){
  //   return getHour(matchDay);
  // }
  // function getGameMin() view public returns (uint8){
  //   return getMinute(matchDay);
  // }
  // function getGameSec() view public returns (uint8){
  //   return getSecond(matchDay);
  // }
}

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
    if (a == 0) {
      return 0;
    }
    c = a * b;
    assert(c / a == b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    // uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return a / b;
  }

  /**
  * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
    c = a + b;
    assert(c >= a);
    return c;
  }
}