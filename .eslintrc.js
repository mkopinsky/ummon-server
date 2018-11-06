module.exports = {
    "extends": "airbnb-base",

    "rules": {

      "func-names": ["warn", "never"],
      "prefer-arrow-callback": "off",
      "no-unused-vars": ["warn", {"args": "none"}],
      "max-len": "off"
    },
    "env": {
        "browser": false,
        "node": true
    }

};