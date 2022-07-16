

const RAP =
{
    'style':'Rap',
    'background': '../genres/Rap/images/rap.png',
    'song_images': ['../genres/Rap/images/song_1.png', '../genres/Rap/images/song_2.png', '../genres/Rap/images/song_3.png',
        '../genres/Rap/images/song_4.png', '../genres/Rap/images/song_5.png', '../genres/Rap/images/song_6.png',
        '../genres/Rap/images/song_7.png', '../genres/Rap/images/song_8.png', '../genres/Rap/images/song_9.png',
        '../genres/Rap/images/song_10.png'],

    'asong_images': ['../genres/Rap/images/asong_1.png', '../genres/Rap/images/asong_2.png', '../genres/Rap/images/asong_3.png',
        '../genres/Rap/images/asong_4.png', '../genres/Rap/images/asong_5.png', '../genres/Rap/images/asong_6.png',
        '../genres/Rap/images/asong_7.png', '../genres/Rap/images/asong_8.png', '../genres/Rap/images/asong_9.png',
        '../genres/Rap/images/asong_10.png'],

    'vibe_image': '../genres/Rap/images/vibe.png',
    'bop_image': '../genres/Rap/images/bop.png',
    'drag_image': '../genres/Rap/images/outline.png',

    'samples': [
        '../genres/Rap/samples/ADMNEVE.wav', '../genres/Rap/samples/ATMTIC.wav', '../genres/Rap/samples/BLEEP.wav',
        '../genres/Rap/samples/BTSNHOOD.wav', '../genres/Rap/samples/BTYCRCK.wav', '../genres/Rap/samples/CMEON.wav',
        '../genres/Rap/samples/COLLEGE.wav', '../genres/Rap/samples/EXPLSN2.wav', '../genres/Rap/samples/FNKYBS.wav',
        '../genres/Rap/samples/FREAK.wav', '../genres/Rap/samples/FRMTHRIB.wav', '../genres/Rap/samples/GMEABT.wav',
        '../genres/Rap/samples/GTWDDT.wav', '../genres/Rap/samples/GUITHT.wav', '../genres/Rap/samples/HOOGIE.wav',
        '../genres/Rap/samples/HPHPCLTR.wav', '../genres/Rap/samples/HPHPSL.wav', '../genres/Rap/samples/HPSNR.wav',
        '../genres/Rap/samples/HRNHT.wav', '../genres/Rap/samples/HTSNR.wav', '../genres/Rap/samples/JB.wav',
        '../genres/Rap/samples/JSTHNGN.wav', '../genres/Rap/samples/KDYKAT.wav', '../genres/Rap/samples/KNWLDGE.wav',
        '../genres/Rap/samples/LKYLOOP.wav', '../genres/Rap/samples/MCBEAT.wav', '../genres/Rap/samples/MLTIHIT.WAV',
        '../genres/Rap/samples/MSWTHME.wav', '../genres/Rap/samples/OKTNSLNGN.wav', '../genres/Rap/samples/OKTN.wav',
        '../genres/Rap/samples/ORCHHT.wav', '../genres/Rap/samples/RADIO4.wav', '../genres/Rap/samples/RADIOSRN.wav',
        '../genres/Rap/samples/RENEGADE!.wav', '../genres/Rap/samples/RPNBLEEP.wav', '../genres/Rap/samples/RPSNR.wav',
        '../genres/Rap/samples/SCRDN.wav', '../genres/Rap/samples/SCRNITCH.wav', '../genres/Rap/samples/SCRSNR.wav',
        '../genres/Rap/samples/SCRSNR2.wav', '../genres/Rap/samples/SCRUP.wav', '../genres/Rap/samples/SIREN.wav',
        '../genres/Rap/samples/STRAPPED.wav', '../genres/Rap/samples/THBMB.wav', '../genres/Rap/samples/VIOLATE.wav',
        '../genres/Rap/samples/WHOOSH.wav',
    ],

    'songalizer': [
        { id: 'MCBEAT', title: 'MC Beat' },
        { id: 'GMEABT', title: 'Gimme A Beat' },
        { id: 'JB', title: 'JB' },
        { id: 'CMEON', title: 'Come On' },
        { id: 'THBMB', title: 'The Bomb' },
        { id: 'HPHPCLTR', title: 'Hip Hop Culture' },
        { id: 'HPHPSL', title: 'Hip Hop Soul' },
        { id: 'FNKYBS', title: 'Funky Bass' },
        { id: 'OKTN', title: 'Oaktown' },
        { id: 'BTSNHOOD', title: 'Beats In The Hood' }
    ],

    'vocalizer': [
        { id: 'RPNBLEEP', title: 'Rappin Bleep' },
        { id: 'BLEEP', title: 'Bleep' },
        { id: 'KNWLDGE', title: 'Knowledge' },
        { id: 'COLLEGE', title: 'College' },
        { id: 'KDYKAT', title: 'Koody Kat' },
        { id: 'BTYCRCK', title: 'Booty Crack' },
        { id: 'ADMNEVE', title: 'Adam & Eve' },
        { id: 'FRMTHRIB', title: 'From The Rib' },

    ],

    'vibeBop': [
        { id: 'SCRUP', title: 'Scratch Up' },
        { id: 'SCRNITCH', title: 'Scratch An Itch' },
        { id: 'HPSNR', title: 'Hip Snare' },
        { id: 'SCRSNR', title: 'Scratch Snare' },
        { id: 'EXPLSN2', title: 'Explosion 2' },
        { id: 'ATMTIC', title: 'Automatic' },
        { id: 'GUITHT', title: 'Guitar Hit' },
        { id: 'ORCHHT', title: 'Orch Hit' },
    ],

    'pitchem': {

        numbers: [
            { id: 'HTSNR', title: 'Hot Snare' },
            { id: 'HRNHT', title: 'Horn Hit' },
            { id: 'EXPLSN2', title: 'Explosion 2' },
            { id: 'MLTIHIT', title: 'Multi Hit' },
            { id: 'HOOGIE', title: 'Hoogie' },
            { id: 'OKTNSLNGN', title: 'Oaktown Slangin' },
            { id: 'JSTHNGN', title: 'Just Hangin' },
        ],

        numMap: {
            'Backquote': -200, 'Digit1': -250, 'Digit2': 0,
            'Digit3': 250, 'Digit4': 500, 'Digit5': 750,
            'Digit6': 1000, 'Digit7': 1250, 'Digit8': 1500,
            'Digit9': 1750, 'Digit0': 2000, 'Minus': 2250, 'Equal': 2500
        },

        keys: [
            { id: 'GUITHT', title: 'Guitar Hit' },
            { id: 'ORCHHT', title: 'Orch Hit' },
            { id: 'HPSNR', title: 'Hip Snare' },
            { id: 'SCRNITCH', title: 'Scratch An Itch' },
            { id: 'ATMTIC', title: 'Automatic' },
            { id: 'FREAK', title: 'Freak' },
            { id: 'GTWDDT', title: 'Get Widdit' },
            { id: 'LKYLOOP', title: 'Looky Loop' },
        ],

        keyMap: {
            'KeyQ': -200, 'KeyW': -250, 'KeyE': 0,
            'KeyR': 250, 'KeyT': 500, 'KeyY': 750,
            'KeyU': 1000, 'KeyI': 1250, 'KeyO': 1500,
            'KeyP': 1750, 'BracketLeft': 2000, 'BracketRight': 2250,
            'Backslash': 2500
        }
    },

    keyMap: [
        { id: 'JSTHNGN', title: 'Just Hangin', key: 'KeyA' },
        { id: 'MSWTHME', title: 'Mess With Me', key: 'KeyS' },
        { id: 'OKTNSLNGN', title: 'Oaktown Slangin', key: 'KeyD' },
        { id: 'VIOLATE', title: 'Violate', key: 'KeyF' },
        { id: 'STRAPPED', title: 'Strapped', key: 'KeyG' },
        { id: 'HOOGIE', title: 'Hoogie', key: 'KeyH' },
        { id: 'LKYLOOP', title: 'Looky Loop', key: 'KeyJ' },
        { id: 'GTWDDT', title: 'Get Widdit', key: 'KeyK' },
        { id: 'FREAK', title: 'Freak', key: 'KeyL' },
        { id: 'RADIO4', title: 'Radio 4', key: 'Semicolon' },
        { id: 'HRNHT', title: 'Horn Hit', key: 'Quote' },
        { id: 'ORCHHT', title: 'Orch Hit', key: 'KeyZ' },
        { id: 'GUITHT', title: 'Guitar Hit', key: 'KeyX' },
        { id: 'HTSNR', title: 'Hot Snare', key: 'KeyC' },
        { id: 'ATMTIC', title: 'Automatic', key: 'KeyV' },
        { id: 'EXPLSN2', title: 'Explosion 2', key: 'KeyB' },
        { id: 'MLTIHIT', title: 'Multi Hit', key: 'KeyN' },
        { id: 'HPSNR', title: 'Hip Snare', key: 'KeyM' },
        { id: 'SCRSNR2', title: 'Scratch Snare 2', key: 'Comma' },
        { id: 'SCRSNR', title: 'Scratch Snare', key: 'Period' },
        { id: 'WHOOSH', title: 'Whoosh', key: 'Slash' }
    ]
}