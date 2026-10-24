# CLI del mod

Trae al repo de Tailspin Toys del asistente el material de las **lecciones propias**. El diseño está en §5 de [`docs/workshop-design.md`](../docs/workshop-design.md).

```sh
npx -y github:emepetres/copilot-devdays-workshop#mod-v1 lesson <pocock|images|docling|extra>
```

El comando se escribe igual en PowerShell, bash y zsh, y se lanza desde la raíz del repo (`package.json` con `"name": "tailspin-toys"`). No sobrescribe ficheros existentes: avisa. Además es idempotente. Si Windows PowerShell bloquea `npx` por la directiva de scripts, se usa `npx.cmd` con los mismos argumentos.

- `cli.mjs`: Node sin dependencias. El `package.json` de la raíz solo publica esta carpeta y no afecta al sitio.
- `lessons/<name>/`: el material de cada lección, con las rutas tal cual quedan en el repo del asistente. Por ejemplo, `lessons/pocock/.github/skills/implement-lite/SKILL.md` acaba en `.github/skills/implement-lite/SKILL.md`.
- `.gitattributes` marca `mod/**` como `-text`. Así los ficheros llegan byte a byte y el shebang conserva LF.
- Pruebas: `npm test` en la raíz del repo.

## Plan B

Solo para copiar ficheros, si `npx github:` falla:

```sh
npx -y degit@3.10.1 --force emepetres/copilot-devdays-workshop/mod/lessons/<name>#mod-v1 .
```

Copia los mismos ficheros, pero con `--force` sobrescribe los que ya existan: no avisa como `lesson`.
