#!/usr/bin/env python3
"""Build js/data.js + variants/classic.json from one source of truth.
Coordinates are real lat/lon (approx. province centres) so the rendered
map is geographically accurate: x from longitude, y from latitude."""
import json, pathlib

# id, name, type(land=inland, coast, sea), sc, home, lat, lon, borders
P = [
("NAO","North Atlantic Ocean","sea",0,"",58.0,-22.0,["IRI","CLY","NWG","MAO"]),
("NWG","Norwegian Sea","sea",0,"",66.0,-2.0,["NAO","BAR","NWY","EDI","NTH","CLY"]),
("BAR","Barents Sea","sea",0,"",71.0,28.0,["NWG","NWY","STP"]),
("CLY","Clyde","coast",0,"",55.4,-4.8,["NAO","NWG","EDI","LVP","IRI"]),
("EDI","Edinburgh","coast",1,"England",55.95,-3.19,["CLY","NWG","NTH","YOR","LVP"]),
("LVP","Liverpool","coast",1,"England",53.4,-2.98,["CLY","EDI","YOR","WAL","IRI"]),
("YOR","Yorkshire","coast",0,"",53.96,-1.08,["EDI","LVP","WAL","LON","NTH"]),
("WAL","Wales","coast",0,"",52.4,-3.7,["LVP","YOR","LON","ENG","IRI"]),
("LON","London","coast",1,"England",51.5,-0.12,["YOR","WAL","ENG","NTH"]),
("IRI","Irish Sea","sea",0,"",53.5,-5.5,["NAO","CLY","LVP","WAL","ENG","MAO"]),
("ENG","English Channel","sea",0,"",49.8,-1.5,["IRI","WAL","LON","NTH","BEL","PIC","BRE","MAO"]),
("NTH","North Sea","sea",0,"",56.0,3.0,["NWG","EDI","YOR","LON","ENG","BEL","HOL","HEL","DEN","SKA","NWY"]),
("HEL","Heligoland Bight","sea",0,"",54.2,7.8,["NTH","HOL","KIE","DEN"]),
("SKA","Skagerrak","sea",0,"",57.8,10.5,["NTH","NWY","SWE","DEN","BAL"]),
("BAL","Baltic Sea","sea",0,"",56.5,19.5,["SKA","DEN","KIE","BER","PRU","LVN","BOT","SWE"]),
("BOT","Gulf of Bothnia","sea",0,"",62.5,20.0,["BAL","SWE","FIN","STP","LVN"]),
("NWY","Norway","coast",1,"",60.5,8.0,["NWG","BAR","NTH","SKA","SWE","STP","FIN"]),
("SWE","Sweden","coast",1,"",59.3,18.1,["NWY","SKA","BAL","BOT","FIN","DEN"]),
("DEN","Denmark","coast",1,"",55.7,12.6,["SKA","BAL","KIE","HEL","NTH","SWE"]),
("FIN","Finland","coast",0,"",61.9,25.7,["NWY","SWE","BOT","STP"]),
("STP","St. Petersburg","coast",1,"Russia",59.93,30.33,["BAR","NWY","FIN","BOT","LVN","MOS"]),
("LVN","Livonia","coast",0,"",57.5,25.0,["BOT","STP","MOS","WAR","PRU","BAL"]),
("MOS","Moscow","land",1,"Russia",55.75,37.62,["STP","LVN","WAR","UKR","SEV"]),
("WAR","Warsaw","land",1,"Russia",52.23,21.01,["LVN","MOS","UKR","GAL","SIL","PRU"]),
("UKR","Ukraine","land",0,"",49.0,31.5,["MOS","WAR","GAL","RUM","SEV"]),
("SEV","Sevastopol","coast",1,"Russia",44.6,33.5,["MOS","UKR","RUM","BLA","ARM"]),
("PRU","Prussia","coast",0,"",54.5,18.5,["BAL","LVN","WAR","SIL","BER"]),
("BER","Berlin","coast",1,"Germany",52.52,13.4,["BAL","PRU","SIL","MUN","KIE"]),
("SIL","Silesia","land",0,"",51.1,17.0,["PRU","WAR","GAL","BOH","MUN","BER"]),
("KIE","Kiel","coast",1,"Germany",54.32,10.12,["HEL","DEN","BAL","BER","MUN","RUH","HOL"]),
("HOL","Holland","coast",1,"",52.37,4.9,["NTH","HEL","KIE","RUH","BEL"]),
("BEL","Belgium","coast",1,"",50.85,4.35,["ENG","NTH","HOL","RUH","BUR","PIC"]),
("RUH","Ruhr","land",0,"",51.5,7.2,["HOL","KIE","MUN","BUR","BEL"]),
("MUN","Munich","land",1,"Germany",48.14,11.58,["KIE","BER","SIL","BOH","TYR","BUR","RUH"]),
("BOH","Bohemia","land",0,"",50.0,15.5,["SIL","GAL","VIE","TYR","MUN"]),
("GAL","Galicia","land",0,"",49.8,23.5,["WAR","UKR","RUM","BUD","VIE","BOH","SIL"]),
("PIC","Picardy","coast",0,"",49.9,2.3,["ENG","BEL","BUR","PAR","BRE"]),
("BRE","Brest","coast",1,"France",48.39,-4.49,["ENG","MAO","PIC","PAR","GAS"]),
("PAR","Paris","land",1,"France",48.85,2.35,["BRE","PIC","BUR","GAS"]),
("BUR","Burgundy","land",0,"",47.2,4.8,["PIC","BEL","RUH","MUN","TYR","MAR","GAS","PAR"]),
("GAS","Gascony","coast",0,"",43.8,-0.5,["BRE","PAR","BUR","MAR","SPA","MAO"]),
("MAO","Mid-Atlantic Ocean","sea",0,"",43.0,-12.0,["NAO","IRI","ENG","BRE","GAS","SPA","POR","WES","NAF"]),
("POR","Portugal","coast",1,"",38.72,-9.14,["MAO","SPA"]),
("SPA","Spain","coast",1,"",40.4,-3.7,["POR","MAO","GAS","MAR","GOL","WES"]),
("MAR","Marseilles","coast",1,"France",43.3,5.37,["GAS","BUR","PIE","GOL","SPA"]),
("PIE","Piedmont","coast",0,"",45.07,7.68,["MAR","TYR","VEN","TUS","GOL"]),
("GOL","Gulf of Lyon","sea",0,"",42.5,4.5,["SPA","MAR","PIE","TUS","TYS","WES"]),
("WES","Western Mediterranean","sea",0,"",39.5,2.0,["MAO","SPA","GOL","TYS","TUN","NAF"]),
("NAF","North Africa","coast",0,"",34.0,-6.0,["MAO","WES","TUN"]),
("TUN","Tunis","coast",1,"",36.8,10.18,["NAF","WES","TYS","ION"]),
("TUS","Tuscany","coast",0,"",43.7,10.4,["PIE","VEN","ROM","TYS","GOL"]),
("ROM","Rome","coast",1,"Italy",41.9,12.5,["TUS","VEN","APU","NAP","TYS"]),
("VEN","Venice","coast",1,"Italy",45.44,12.32,["PIE","TYR","TRI","ADR","APU","ROM","TUS"]),
("APU","Apulia","coast",0,"",41.1,16.9,["VEN","ROM","NAP","ION","ADR"]),
("NAP","Naples","coast",1,"Italy",40.85,14.27,["ROM","APU","ION","TYS"]),
("TYS","Tyrrhenian Sea","sea",0,"",40.0,12.0,["GOL","TUS","ROM","NAP","ION","TUN","WES"]),
("TYR","Tyrolia","land",0,"",47.25,11.4,["MUN","BOH","VIE","TRI","VEN","PIE","BUR"]),
("VIE","Vienna","land",1,"Austria",48.2,16.37,["BOH","GAL","BUD","TRI","TYR"]),
("BUD","Budapest","land",1,"Austria",47.5,19.05,["GAL","RUM","SER","TRI","VIE"]),
("TRI","Trieste","coast",1,"Austria",45.65,13.78,["TYR","VIE","BUD","SER","ALB","ADR","VEN"]),
("ADR","Adriatic Sea","sea",0,"",43.5,15.5,["VEN","TRI","ALB","ION","APU"]),
("ALB","Albania","coast",0,"",41.3,19.8,["TRI","SER","GRE","ION","ADR"]),
("SER","Serbia","land",1,"",44.8,20.45,["BUD","RUM","BUL","GRE","ALB","TRI"]),
("RUM","Rumania","coast",1,"",44.43,26.1,["GAL","UKR","SEV","BLA","BUL","SER","BUD"]),
("BUL","Bulgaria","coast",1,"",42.7,23.3,["SER","RUM","BLA","CON","GRE","AEG"]),
("GRE","Greece","coast",1,"",37.98,23.73,["ALB","SER","BUL","AEG","ION"]),
("ION","Ionian Sea","sea",0,"",38.0,19.0,["TYS","NAP","APU","ADR","ALB","GRE","AEG","EMS","TUN"]),
("CON","Constantinople","coast",1,"Turkey",41.0,28.97,["BUL","BLA","ANK","SMY","AEG"]),
("ANK","Ankara","coast",1,"Turkey",39.93,32.86,["CON","BLA","ARM","SMY"]),
("ARM","Armenia","coast",0,"",40.5,43.5,["SEV","BLA","ANK","SMY","SYR"]),
("SMY","Smyrna","coast",1,"Turkey",38.42,27.14,["CON","ANK","ARM","SYR","EMS","AEG"]),
("SYR","Syria","coast",0,"",35.5,38.0,["ARM","SMY","EMS"]),
("AEG","Aegean Sea","sea",0,"",38.5,25.5,["ION","GRE","BUL","CON","SMY","EMS"]),
("EMS","Eastern Mediterranean","sea",0,"",34.5,28.0,["ION","AEG","SMY","SYR"]),
("BLA","Black Sea","sea",0,"",43.5,34.5,["RUM","SEV","ARM","ANK","CON","BUL"]),
]

# symmetrise
borders = {p[0]: set(p[7]) for p in P}
for a, bs in list(borders.items()):
    for b in list(bs):
        borders[b].add(a)

provinces = []
for pid, name, typ, sc, home, lat, lon, _ in P:
    provinces.append({"id": pid, "name": name, "type": typ, "supplyCenter": bool(sc),
                      "home": home or None, "lat": lat, "lon": lon,
                      "borders": sorted(borders[pid])})

starts = {
 "England": [{"unit":"F","prov":"EDI"},{"unit":"F","prov":"LON"},{"unit":"A","prov":"LVP"}],
 "France": [{"unit":"A","prov":"PAR"},{"unit":"A","prov":"MAR"},{"unit":"F","prov":"BRE"}],
 "Germany": [{"unit":"A","prov":"BER"},{"unit":"A","prov":"MUN"},{"unit":"F","prov":"KIE"}],
 "Italy": [{"unit":"A","prov":"ROM"},{"unit":"A","prov":"VEN"},{"unit":"F","prov":"NAP"}],
 "Austria": [{"unit":"A","prov":"VIE"},{"unit":"A","prov":"BUD"},{"unit":"F","prov":"TRI"}],
 "Russia": [{"unit":"A","prov":"MOS"},{"unit":"A","prov":"WAR"},{"unit":"F","prov":"SEV"},{"unit":"F","prov":"STP"}],
 "Turkey": [{"unit":"A","prov":"CON"},{"unit":"A","prov":"SMY"},{"unit":"F","prov":"ANK"}],
}
owners = {}
for p in provinces:
    if p["supplyCenter"]:
        owners[p["id"]] = p["home"]  # None for neutral

variant = {"variant":"Classic","source":"Original data compiled for this project. Territory/border structure follows the classic Diplomacy map design and the vDiplomacy/webDiplomacy variant data model (territories, types, borders, home centres, coordinates) so variant JSON files in that model can be imported. Map artwork and coordinates are original: lat/lon are real province-centre coordinates.",
           "territories": provinces, "startingUnits": starts, "winSupplyCenters": 18,
           "notes": ["Bulgaria, Spain and St. Petersburg are modelled as single-coast provinces in v1 for beginner clarity; the variant JSON schema supports splitting them into separate coast territories exactly as vDiplomacy does, and an imported split-coast variant will play with separate coasts."]}

root = pathlib.Path(__file__).parent
(root/"variants"/"classic.json").write_text(json.dumps(variant, indent=1))
data_js = "// Generated from tools_build_data.py — do not edit provinces by hand.\nwindow.DIP_DATA = " + json.dumps({"provinces": provinces, "startingUnits": starts, "winSupplyCenters": 18}) + ";\n"
(root/"js"/"data.js").write_text(data_js)
print(f"{len(provinces)} provinces, {sum(p['supplyCenter'] for p in provinces)} SCs")
assert sum(p['supplyCenter'] for p in provinces) == 34, "must be 34 SCs"
for p in provinces:
    for b in p["borders"]:
        assert b in borders, b
print("adjacency symmetric OK")
