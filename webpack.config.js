const path = require('path');

module.exports = {
    target: 'node',
    entry: './server.js',
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'bundle.js'

    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
}