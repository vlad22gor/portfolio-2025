export default {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          cleanupIds: false,
          convertPathData: false,
          mergePaths: false,
          convertShapeToPath: false,
          convertTransform: false,
        },
      },
    },
    'sortAttrs',
    'removeDimensions',
  ],
};
