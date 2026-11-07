"""Regenerate the explainer with the same Microsoft Ryan voice.
Development-only prerequisites: pip install edge-tts mutagen
The published app plays the committed audio files; it calls no speech service.
"""
import asyncio,json,math
from pathlib import Path
import edge_tts
from mutagen.mp3 import MP3
VOICE='en-GB-RyanNeural'
SCENES=[
 ('capture','Start by uploading a document, or scanning the code on a master air waybill, C M R, or manifest.','Lade ein Dokument hoch oder scanne den Code auf einem Hauptluftfrachtbrief, CMR oder Manifest.'),
 ('compare','Next, compare the shipment references, piece count, and gross weight across the documents.','Vergleiche danach Sendungsreferenzen, Packstückzahl und Bruttogewicht in den Dokumenten.'),
 ('flag','CargoClear flags missing information and mismatched details, so you know what needs attention.','CargoClear markiert fehlende Angaben und Abweichungen, damit du weißt, was geprüft werden muss.'),
 ('review','Check the evidence, resolve discrepancies, and record your review. A person makes the final decision. These checks do not confirm customs release.','Prüfe Nachweise, kläre Abweichungen und dokumentiere deine Prüfung. Ein Mensch entscheidet. Diese Prüfungen bestätigen keine Zollfreigabe.'),
]
async def main():
 voices=await edge_tts.list_voices()
 selected=next((v for v in voices if v['ShortName']==VOICE and v['Gender']=='Male'),None)
 if not selected:raise RuntimeError('The requested Microsoft Ryan voice is unavailable. No substitute will be used.')
 root=Path(__file__).resolve().parent.parent
 folder=root/'public'/'audio'/'workflow-ryan'
 folder.mkdir(parents=True,exist_ok=True)
 segments=[]
 start=0.35
 for name,text,german in SCENES:
  filename=name+'.mp3'
  await edge_tts.Communicate(text,VOICE,rate='-5%').save(str(folder/filename))
  seconds=MP3(folder/filename).info.length
  if seconds<1:raise RuntimeError('Generated speech is unexpectedly short.')
  segments.append({'id':name,'file':filename,'text':text,'german':german,'startSeconds':round(start,4),'audioSeconds':round(seconds,4)})
  start+=seconds+0.45
  print(name+': '+str(round(seconds,2))+' seconds')
 metadata={'provider':'Microsoft Edge online speech','voiceId':VOICE,'voiceName':'Microsoft Ryan','language':'en-GB','rate':'-5%','durationSeconds':round(start+0.4,4),'segments':segments}
 (folder/'narration.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding='utf-8')
 (root/'app'/'workflow-narration.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding='utf-8')
 print('Narration generated: '+VOICE+'; '+str(round(start+0.4,2))+' seconds total.')
asyncio.run(main())
