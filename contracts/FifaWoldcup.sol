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
    string teamA;
    string teamB;
    uint startTime;
    uint32 voteCount; 
    uint256 win;
    uint256 draw;
    uint256 lose;
    uint8 result;
    mapping(address => Vote) votes;
  }

  event Deposit(
    address indexed _from,
    uint16 _gameId,
    uint8 _direction,
    uint _value
  );

  mapping (uint16 => Game) games;
  uint16 gameCount;
  uint delay = 0;
  uint256 researchPot;

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
  function getTeamA(uint16 _gameId) public view returns (string) {
    return games[_gameId].teamA;
  }
  function getTeamB(uint16 _gameId) public view returns (string) {
    return games[_gameId].teamB;
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
  function getResearchPot() public view onlyOwner returns (uint256) {
    return researchPot;
  }

  function addGame(string _teamA, string _teamB, uint _startTime) public onlyOwner {
    games[gameCount].teamA = _teamA;
    games[gameCount].teamB = _teamB;
    games[gameCount].startTime = _startTime;
    gameCount++;
  }

  function castVote(uint16 _gameId, uint8 _direction) public payable onlyNotFinished(_gameId) {
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

    emit Deposit(msg.sender, _gameId, _direction, msg.value);
  }
  function getDeposit(uint16 _gameId, address _voter) view public returns (uint256) {
    Game storage game = games[_gameId];
    Vote storage myVote = game.votes[_voter];
    return myVote.deposit;
  }
  function getVote(uint16 _gameId, address _voter) view public returns (uint8) {
    Game storage game = games[_gameId];
    Vote storage myVote = game.votes[_voter];
    return myVote.vote;
  }
  function getWinning(uint16 _gameId, address _voter) view public returns (uint256) {
    uint256 winning;
    Game storage game = games[_gameId];
    Vote storage myVote = game.votes[_voter];
    if (game.result == 0)
      return 0;
    if (game.result != myVote.vote)
      return 0;
    uint256 pot;
    uint base = 10 ** 9;
    uint fraction;
    
    if (myVote.vote == 1) {
      pot = pot.add(game.draw);
      pot = pot.add(game.lose);
    } else if (myVote.vote == 2) {
      pot = pot.add(game.win);
      pot = pot.add(game.lose);
    } else if (myVote.vote == 3) {
      pot = pot.add(game.win);
      pot = pot.add(game.draw);
    }

    fraction = (myVote.deposit.mul(base)).div(pot);
    winning = (pot.mul(fraction)).div(base);
    winning = winning.add(myVote.deposit);
    return winning;
  }

  function withdraw(uint16 _gameId) public returns(uint) {
    Game storage game = games[_gameId];
    Vote storage myVote = game.votes[msg.sender];
    uint256 winning = getWinning(_gameId, msg.sender);

    if (winning <= 0) 
      return 0;
    if (game.result == 0)
      return 0;
    if (game.result != myVote.vote)
      return 0;

    uint256 winning1Percent = winning / 100;
    researchPot = researchPot.add(winning1Percent);
    uint256 winning99Percent = winning1Percent.mul(99);
    myVote.vote = 0;
    msg.sender.transfer(winning99Percent);
    return winning99Percent;
  }
  function canWithDraw(uint16 _gameId) view public returns(bool) {
    Game storage game = games[_gameId];
    Vote storage myVote = game.votes[msg.sender];
    if (game.result == 0) {
      return false;
    }
    return (game.result == myVote.vote);
  }
  function getPaid(uint256 amount) public onlyOwner {
    researchPot = researchPot.sub(amount);
    msg.sender.transfer(amount);
  }
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