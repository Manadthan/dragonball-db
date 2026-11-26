import { describe, expect, it } from "vitest";
import {
  baseVisuel,
  cheminVisuel,
  estJaquetteHdValide,
  resoudreImageObjet,
  srcsetVisuel,
  urlJaquettePonyCanyon,
  urlVisuel,
} from "./stockage";

const BASE_URL = "https://exemple.supabase.co";

describe("stockage des visuels dragonball-visuels", () => {
  it("construit base, chemins WebP, URL publique et srcSet 300w/680w", () => {
    const base = baseVisuel("dbz-dvd-jp-01", "v1");
    expect(base).toBe("dbz-dvd-jp-01-v1");
    expect(cheminVisuel(base, 300)).toBe("dbz-dvd-jp-01-v1-300.webp");
    expect(cheminVisuel(base, 680)).toBe("dbz-dvd-jp-01-v1-680.webp");
    expect(urlVisuel(base, 680, `${BASE_URL}/`)).toBe(
      "https://exemple.supabase.co/storage/v1/object/public/dragonball-visuels/dbz-dvd-jp-01-v1-680.webp",
    );
    expect(srcsetVisuel(base, BASE_URL)).toBe(
      "https://exemple.supabase.co/storage/v1/object/public/dragonball-visuels/dbz-dvd-jp-01-v1-300.webp 300w, " +
        "https://exemple.supabase.co/storage/v1/object/public/dragonball-visuels/dbz-dvd-jp-01-v1-680.webp 680w",
    );
  });

  it("rejette les chemins hors format (traversée de répertoire, majuscules)", () => {
    expect(() => baseVisuel("../hack", "v1")).toThrow();
    expect(() => baseVisuel("dbz-dvd-jp-01", "V1!")).toThrow();
    expect(() => cheminVisuel("../hack", 300)).toThrow();
  });

  it("donne priorité au bucket dragonball-visuels puis retombe sur imageUrl", () => {
    expect(
      resoudreImageObjet(
        {
          imagePath: "dbz-dvd-jp-01-v1",
          imageUrl: "https://autre.fr/img.jpg",
        },
        BASE_URL,
      ),
    ).toBe(
      "https://exemple.supabase.co/storage/v1/object/public/dragonball-visuels/dbz-dvd-jp-01-v1-680.webp",
    );
    expect(
      resoudreImageObjet(
        { imagePath: null, imageUrl: "https://autre.fr/img.jpg" },
        BASE_URL,
      ),
    ).toBe("https://autre.fr/img.jpg");
    expect(
      resoudreImageObjet({ imagePath: null, imageUrl: null }, BASE_URL),
    ).toBeNull();
  });

  it("construit l'URL officielle Pony Canyon HD (size=6) pour une référence PCBC", () => {
    expect(urlJaquettePonyCanyon("PCBC-50781")).toBe(
      "https://www.ponycanyon.co.jp/images/wcms/accessor/bin/jacket/PCBC000050781.jpg?size=6&order=1",
    );
    expect(urlJaquettePonyCanyon("PCBC-50829")).toBe(
      "https://www.ponycanyon.co.jp/images/wcms/accessor/bin/jacket/PCBC000050829.jpg?size=6&order=1",
    );
    expect(urlJaquettePonyCanyon("9782723418560")).toBeNull();
    expect(urlJaquettePonyCanyon(null)).toBeNull();
  });

  it("valide les dimensions HD minimales (≥ 500×700 px)", () => {
    expect(estJaquetteHdValide({ width: 690, height: 1000 })).toBe(true);
    expect(estJaquetteHdValide({ width: 674, height: 1000 })).toBe(true);
    expect(estJaquetteHdValide({ width: 210, height: 300 })).toBe(false);
    expect(estJaquetteHdValide({})).toBe(false);
  });
});
