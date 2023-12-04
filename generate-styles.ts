const { registerTransforms } = require('@tokens-studio/sd-transforms');
const StyleDictionary = require('style-dictionary');
const { promises } = require('fs');

const rootDir = 'tokens';
registerTransforms(StyleDictionary);

function generateStyles() {
    promises.readFile(`${rootDir}/$metadata.json`, 'utf-8').then((metadata) => {
        const filePaths = JSON.parse(metadata).tokenSetOrder;
        promises.readFile(`${rootDir}/$themes.json`, 'utf-8').then((themesContent) => {
            const themes = JSON.parse(themesContent);
            const configs = themes.map((theme) => ({
                source: Object.entries(theme.selectedTokenSets)
                    .filter(([, val]) => val !== 'disabled')
                    .map(([tokenSet]) => {
                        return `tokens/${filePaths.find((file) => file.endsWith(tokenSet))}.json`
                    }),
                platforms: {
                    ts: {
                        transformGroup: 'tokens-studio',
                        buildPath: 'dist/web/ts/',
                        files: [
                            {
                                destination: `${theme.name}.ts`,
                                format: 'javascript/es6',
                            },
                        ],
                    },
                    scss: {
                        transforms: [
                            'ts/descriptionToComment',
                            'ts/opacity',
                            'ts/size/lineheight',
                            'ts/typography/fontWeight',
                            'ts/resolveMath',
                            'ts/size/css/letterspacing',
                            'ts/typography/css/fontFamily',
                            'ts/typography/css/shorthand',
                            'ts/border/css/shorthand',
                            'ts/shadow/css/shorthand',
                            'ts/color/css/hexrgba',
                            'ts/color/modifiers',
                            'name/cti/kebab',
                        ],
                        buildPath: 'dist/web/themes/',
                        files: [
                            {
                                destination: `${theme.name}.scss`,
                                format: 'scss/variables',
                            },
                        ],
                    },
                },
            }));
            configs.forEach(cfg => {
                const sd = StyleDictionary.extend(cfg);
                sd.cleanAllPlatforms();
                sd.buildAllPlatforms();
            });
        })
    })
}

generateStyles();