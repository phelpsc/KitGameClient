var app = {

  history: [],
  historyLineCount: 0,
  command: "",
  windowHeight: 0,
  promptHeight: 0,
  scrollbackHeight: 0,
  promptBase: "K:> ",
  socket: null,
  connection: false,

  init: function() {
    var self = this;
    self.bindKeyboardEvents();
    self.setLayout();
    self.renderPrompt();
    //self.initSocket();
  },

  initSocket: function(server) {
    var self = this;
    //self.socket = new WebSocket("ws://192.168.1.152:9000");
    self.printServerMessage("Attempting to connect to: " + server);

    try {
        self.socket = new WebSocket("ws://" + server);

        self.socket.onopen = function (event) {
          self.printServerMessage("Connected.");
          self.printServerMessage(" ");
          self.connection = true;
        };

        self.socket.onmessage = function (event) {
          try {
            var server_message = JSON.parse(event.data)

            //Todo: Evaluate server_message[0] for type
            //Todo: Evaluate serve_message[2] for prompt text

            server_message[1].forEach(function(msg) {
              self.printServerMessage(msg)
            });

          } catch(data_error) {
            console.log("Error parsing websocket server message.");
            console.log()
          }
        };

        self.socket.onclose = function (event) {
          self.printServerMessage("Connection lost.");
          self.printServerMessage(" ");
          self.connection = false;
        };

        self.socket.onerror = function (event) {
          self.printServerMessage("There was an error connecting. Please try again.");
          self.printServerMessage(" ");
          console.log(event);
        };
    } catch(err) {
      self.printServerMessage("There was an error connecting. Please try again.");
      self.printServerMessage(" ");
      console.log(err);
    }

  },

  setLayout: function() {
    var self = this;
    self.windowHeight = isNaN(window.innerHeight) ? window.clientHeight : window.innerHeight;
    self.promptHeight = document.getElementById('prompt').clientHeight;
    self.scrollbackHeight = self.windowHeight - self.promptHeight - 20;
    document.getElementById('scrollback').style.height = self.scrollbackHeight + "px";

    //TODO dynamically set historyLineCount based on screen height
    self.historyLineCount = 45;

    //initialize output history array
    for (var i=0; i<self.historyLineCount; i++) {
      self.history[i] = " ";
    }

    self.printServerMessage("Welcome to KitGameClient.");
    self.printServerMessage("Please enter your server host to connect.");
  },

  bindKeyboardEvents: function() {
    var self = this;
    document.getElementById('app').addEventListener('keypress', function(e) {
      (e.key != "Enter") ? self.command += e.key : self.runCommand();
      self.renderPrompt();
    });
    document.getElementById('app').addEventListener('keydown', function(e) {
      if (e.key == "Backspace" && self.command != "") {
        self.command = self.command.slice(0, self.command.length - 1);
        self.renderPrompt();
      };
    });
  },

  runCommand: function() {
    var self = this;
    self.pushToHistory(" ");
    self.pushToHistory("> " + self.command);

    if (self.connection) {
      self.socket.send(self.command);
    } else {
      self.initSocket(self.command);
    }

    self.command = "";
    self.renderPrompt();
    self.renderHistory();
  },

  printServerMessage: function(message) {
    var self = this;
    self.pushToHistory(message);
    self.renderHistory();
  },

  pushToHistory: function(str) {
    var self = this;
    self.history.push(str);
    self.history = self.history.slice(1, self.history.length);
  },

  renderPrompt: function() {
    var self = this;
    document.getElementById('prompt').innerHTML = self.promptBase + self.command;
  },

  renderHistory: function() {
    var self = this;
    var scrollbackHTML = "";
    for (var i=0; i<self.history.length; i++) {
      scrollbackHTML += self.history[i] + "<br>";
    }
    document.getElementById('scrollback').innerHTML = scrollbackHTML;
  }

};
