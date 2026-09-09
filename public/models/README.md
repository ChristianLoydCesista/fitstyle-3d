# Models

The production viewer expects:

```text
public/models/Michelle.glb
```

Download the model from the official three.js repository by running:

```bash
npm run model:michelle
```

The application will still start without the file. In that case it displays a
procedural development fallback and tells you that Michelle needs to be added.

For GitHub deployment, commit `Michelle.glb` after downloading it if you want
the deployed site to show Michelle without another asset host.

Before using any third-party 3D asset commercially, verify the asset's specific
upstream license and attribution requirements.
