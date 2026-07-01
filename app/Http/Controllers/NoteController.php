<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
public function index()
{
    $notes = auth()->user()->notes()->latest()->get();
    return view('notes.notebook', compact('notes'));
}

public function store(Request $request)
{
    $validated = $request->validate([
        'title'   => 'required|string|max:255',
        'content' => 'nullable|string',
        'status'  => 'required|in:not_started,in_progress,completed',
    ]);

    $note = auth()->user()->notes()->create($validated);

    return response()->json($note, 201);
}

public function update(Request $request, Note $note)
{
    abort_if($note->user_id !== auth()->id(), 403);

    $validated = $request->validate([
        'title'   => 'required|string|max:255',
        'content' => 'nullable|string',
        'status'  => 'required|in:not_started,in_progress,completed',
    ]);

    $note->update($validated);
    return response()->json($note);
}

public function destroy(Note $note)
{
    abort_if($note->user_id !== auth()->id(), 403);
    $note->delete();
    return response()->json(['success' => true]);
}
}
